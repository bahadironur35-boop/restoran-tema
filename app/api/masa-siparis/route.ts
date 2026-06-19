import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { masaId, items, notlar } = await req.json();

  if (!masaId || !items?.length) {
    return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
  }

  const qrAyar = await prisma.ayar.findUnique({ where: { key: "qrSiparisAktif" } });
  if (qrAyar?.value === "false") return NextResponse.json({ error: "QR sipariş şu an devre dışı" }, { status: 403 });

  const masa = await prisma.masa.findUnique({ where: { id: Number(masaId) } });
  if (!masa) return NextResponse.json({ error: "Masa bulunamadı" }, { status: 404 });

  const siparis = await prisma.siparis.create({
    data: {
      masaId: Number(masaId),
      notlar: notlar || null,
      items: {
        create: items.map((item: { menuItemId: number; name: string; price: string; adet: number; not?: string }) => ({
          menuItemId: item.menuItemId,
          name: item.name,
          price: item.price,
          adet: item.adet,
          not: item.not || null,
        })),
      },
    },
    include: { items: true, masa: true },
  });

  // Stok otomatik düşme (ayar kontrolü)
  const stokAyar = await prisma.ayar.findUnique({ where: { key: "stokOtomatikDusme" } });
  if (stokAyar?.value === "true") for (const item of items as { menuItemId: number; adet: number }[]) {
    const stokBaglantilari = await prisma.menuItemStok.findMany({
      where: { menuItemId: item.menuItemId },
    });
    for (const baglanti of stokBaglantilari) {
      const dusecekMiktar = baglanti.miktar * item.adet;
      await prisma.$transaction([
        prisma.stokItem.update({
          where: { id: baglanti.stokItemId },
          data: { miktar: { decrement: dusecekMiktar } },
        }),
        prisma.stokHareket.create({
          data: {
            stokItemId: baglanti.stokItemId,
            tip: "cikis",
            miktar: dusecekMiktar,
            aciklama: `Sipariş #${siparis.id} — Masa ${masa.no}`,
          },
        }),
      ]);
    }
  }

  return NextResponse.json(siparis);
}
