import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await params;
  const data = await req.json();
  const item = await prisma.menuItem.update({ where: { id: Number(id) }, data });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await params;
  await prisma.menuItem.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
