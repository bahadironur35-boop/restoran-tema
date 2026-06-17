import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await params;
  const { durum } = await req.json();
  const siparis = await prisma.siparis.update({
    where: { id: Number(id) },
    data: { durum },
    include: { items: true, masa: true },
  });
  return NextResponse.json(siparis);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await params;
  await prisma.siparis.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
