import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const siparis = await prisma.teslimatSiparis.findUnique({
    where: { id: Number(id) },
    include: { items: true },
  });
  if (!siparis) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(siparis);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const siparis = await prisma.teslimatSiparis.update({
    where: { id: Number(id) },
    data: body,
    include: { items: true },
  });
  return NextResponse.json(siparis);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.teslimatSiparis.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
