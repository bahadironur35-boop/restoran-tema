import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const musteri = await prisma.musteri.findUnique({
    where: { id: Number(id) },
    include: {
      ziyaretler: { orderBy: { createdAt: "desc" } },
      rezervasyonlar: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!musteri) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(musteri);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await params;
  const data = await req.json();
  const musteri = await prisma.musteri.update({ where: { id: Number(id) }, data });
  return NextResponse.json(musteri);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await params;
  await prisma.musteri.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
