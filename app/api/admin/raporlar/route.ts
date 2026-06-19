import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

function parsePrice(p: string): number {
  return parseFloat(p.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
}

function startOf(period: string): Date {
  const d = new Date();
  if (period === "gunluk") {
    d.setHours(0, 0, 0, 0);
  } else if (period === "haftalik") {
    d.setDate(d.getDate() - 6);
    d.setHours(0, 0, 0, 0);
  } else {
    d.setDate(d.getDate() - 29);
    d.setHours(0, 0, 0, 0);
  }
  return d;
}

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const period    = searchParams.get("period") ?? "haftalik";
  const baslangicParam = searchParams.get("baslangic");
  const bitisParam     = searchParams.get("bitis");

  let baslangic: Date;
  let bitis: Date = new Date();
  bitis.setHours(23, 59, 59, 999);

  if (baslangicParam && bitisParam) {
    baslangic = new Date(baslangicParam + "T00:00:00");
    bitis     = new Date(bitisParam + "T23:59:59");
  } else {
    baslangic = startOf(period);
  }

  const siparisler = await prisma.siparis.findMany({
    where: { durum: "teslim", createdAt: { gte: baslangic, lte: bitis } },
    include: { items: true, masa: { select: { no: true, alan: true } } },
    orderBy: { createdAt: "asc" },
  });

  // Toplam gelir & sipariş adedi
  let toplamGelir = 0;
  for (const s of siparisler) {
    for (const item of s.items) {
      toplamGelir += parsePrice(item.price) * item.adet;
    }
  }
  const siparisAdedi = siparisler.length;
  const ortalamaFatura = siparisAdedi > 0 ? toplamGelir / siparisAdedi : 0;

  // Günlük trend
  const gunlukMap: Record<string, { gelir: number; adet: number }> = {};
  for (const s of siparisler) {
    const gun = s.createdAt.toISOString().split("T")[0];
    if (!gunlukMap[gun]) gunlukMap[gun] = { gelir: 0, adet: 0 };
    gunlukMap[gun].adet += 1;
    for (const item of s.items) {
      gunlukMap[gun].gelir += parsePrice(item.price) * item.adet;
    }
  }
  const gunlukTrend = Object.entries(gunlukMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([tarih, data]) => ({ tarih, ...data }));

  // En çok satılan ürünler
  const urunMap: Record<string, { adet: number; gelir: number }> = {};
  for (const s of siparisler) {
    for (const item of s.items) {
      if (!urunMap[item.name]) urunMap[item.name] = { adet: 0, gelir: 0 };
      urunMap[item.name].adet += item.adet;
      urunMap[item.name].gelir += parsePrice(item.price) * item.adet;
    }
  }
  const populerUrunler = Object.entries(urunMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.adet - a.adet)
    .slice(0, 10);

  // Masa başı gelir
  const masaMap: Record<string, { no: number; alan: string; gelir: number; siparisSayisi: number }> = {};
  for (const s of siparisler) {
    const key = String(s.masaId);
    if (!masaMap[key]) masaMap[key] = { no: s.masa.no, alan: s.masa.alan, gelir: 0, siparisSayisi: 0 };
    masaMap[key].siparisSayisi += 1;
    for (const item of s.items) {
      masaMap[key].gelir += parsePrice(item.price) * item.adet;
    }
  }
  const masaBaziGelir = Object.values(masaMap)
    .map((m) => ({ ...m, ortalama: m.siparisSayisi > 0 ? m.gelir / m.siparisSayisi : 0 }))
    .sort((a, b) => b.gelir - a.gelir)
    .slice(0, 10);

  // Ödeme yöntemi dağılımı
  const odemeler = await prisma.odeme.findMany({
    where: { createdAt: { gte: baslangic, lte: bitis } },
    select: { yontem: true, tutar: true },
  });
  const odemeMap: Record<string, { adet: number; tutar: number }> = {};
  for (const o of odemeler) {
    if (!odemeMap[o.yontem]) odemeMap[o.yontem] = { adet: 0, tutar: 0 };
    odemeMap[o.yontem].adet += 1;
    odemeMap[o.yontem].tutar += o.tutar;
  }
  const odemeDagilimi = Object.entries(odemeMap).map(([yontem, data]) => ({ yontem, ...data }));
  const kasaGelir = odemeler.reduce((s, o) => s + o.tutar, 0);

  return NextResponse.json({
    toplamGelir,
    kasaGelir,
    siparisAdedi,
    ortalamaFatura,
    gunlukTrend,
    populerUrunler,
    masaBaziGelir,
    odemeDagilimi,
  });
}
