import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const siparisler = await prisma.teslimatSiparis.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(siparisler);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { musteriAdi, telefon, adres, notlar, kurye, items } = body as {
    musteriAdi: string;
    telefon: string;
    adres: string;
    notlar?: string;
    kurye?: string;
    items: { name: string; price: number; adet: number }[];
  };

  if (!musteriAdi || !telefon || !adres || !items?.length) {
    return NextResponse.json({ error: "Eksik alan" }, { status: 400 });
  }

  const toplamTutar = items.reduce((s, i) => s + i.price * i.adet, 0);

  const siparis = await prisma.teslimatSiparis.create({
    data: {
      musteriAdi,
      telefon,
      adres,
      notlar,
      kurye,
      toplamTutar,
      items: { create: items },
    },
    include: { items: true },
  });

  return NextResponse.json(siparis);
}
