import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const gecmis = req.nextUrl.searchParams.get("gecmis") === "true";
  const tarih  = req.nextUrl.searchParams.get("tarih"); // YYYY-MM-DD

  if (gecmis) {
    const baslangic = tarih
      ? new Date(tarih + "T00:00:00")
      : new Date(Date.now() - 6 * 86400000);
    const bitis = tarih
      ? new Date(tarih + "T23:59:59")
      : new Date();
    const siparisler = await prisma.siparis.findMany({
      where: { durum: "teslim", createdAt: { gte: baslangic, lte: bitis } },
      include: { items: true, masa: { select: { no: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(siparisler);
  }

  const masaIdParam = req.nextUrl.searchParams.get("masaId");
  const siparisler = await prisma.siparis.findMany({
    where: {
      durum: { not: "teslim" },
      ...(masaIdParam ? { masaId: parseInt(masaIdParam) } : {}),
    },
    include: { items: true, masa: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(siparisler);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { masaId, items, notlar } = await req.json();
  const siparis = await prisma.siparis.create({
    data: { masaId: masaId ? Number(masaId) : null, notlar, items: { create: items } },
    include: { items: true, masa: true },
  });

  // Stok otomatik düşme (ayar kontrolü)
  const stokAyar = await prisma.ayar.findUnique({ where: { key: "stokOtomatikDusme" } });
  if (stokAyar?.value === "true") for (const item of items as { menuItemId: number; adet: number }[]) {
    const stokBaglantilari = await prisma.menuItemStok.findMany({
      where: { menuItemId: item.menuItemId },
    });
    for (const b of stokBaglantilari) {
      const miktar = b.miktar * item.adet;
      await prisma.$transaction([
        prisma.stokItem.update({ where: { id: b.stokItemId }, data: { miktar: { decrement: miktar } } }),
        prisma.stokHareket.create({
          data: { stokItemId: b.stokItemId, tip: "cikis", miktar, aciklama: `Sipariş #${siparis.id}${siparis.masa ? ` — Masa ${siparis.masa.no}` : " — Paket"}` },
        }),
      ]);
    }
  }

  return NextResponse.json(siparis);
}
