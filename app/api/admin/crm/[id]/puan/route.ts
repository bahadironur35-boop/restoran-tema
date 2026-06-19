import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

// Puan geçmişi
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const hareketler = await prisma.puanHareket.findMany({
    where: { musteriId: parseInt((await params).id) },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(hareketler);
}

// Manuel puan ekle / düş
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { miktar, aciklama } = await req.json();
  const musteriId = parseInt((await params).id);

  await prisma.$transaction([
    prisma.puanHareket.create({
      data: { musteriId, tip: miktar > 0 ? "manuel" : "harcadi", miktar, aciklama: aciklama || null },
    }),
    prisma.musteri.update({
      where: { id: musteriId },
      data: { puan: { increment: miktar } },
    }),
  ]);

  const musteri = await prisma.musteri.findUnique({ where: { id: musteriId }, select: { puan: true } });
  return NextResponse.json({ puan: musteri?.puan });
}
