import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await params;
  const stoklar = await prisma.menuItemStok.findMany({
    where: { menuItemId: Number(id) },
    include: { stokItem: true },
  });
  return NextResponse.json(stoklar);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await params;
  const { stokItemId, miktar } = await req.json();
  const link = await prisma.menuItemStok.create({
    data: { menuItemId: Number(id), stokItemId: Number(stokItemId), miktar: Number(miktar) },
    include: { stokItem: true },
  });
  return NextResponse.json(link);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await params;
  const { linkId } = await req.json();
  await prisma.menuItemStok.delete({ where: { id: Number(linkId), menuItemId: Number(id) } });
  return NextResponse.json({ success: true });
}
