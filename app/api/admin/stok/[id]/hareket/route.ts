import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await params;
  const { tip, miktar, aciklama } = await req.json();

  const adet = Number(miktar);

  await prisma.stokHareket.create({
    data: { stokItemId: Number(id), tip, miktar: adet, aciklama },
  });

  // Stok miktarını güncelle
  await prisma.stokItem.update({
    where: { id: Number(id) },
    data: { miktar: { increment: tip === "giris" ? adet : -adet } },
  });

  const updated = await prisma.stokItem.findUnique({
    where: { id: Number(id) },
    include: { hareketler: { orderBy: { createdAt: "desc" } } },
  });

  return NextResponse.json(updated);
}
