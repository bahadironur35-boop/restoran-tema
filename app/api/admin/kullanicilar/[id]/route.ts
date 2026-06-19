import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasRole("admin"))) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  const { id } = await params;
  const { name, email, password, role, active } = await req.json();
  const data: Record<string, unknown> = { name, email, role, active };
  if (password) data.password = await bcrypt.hash(password, 10);
  const user = await prisma.kullanici.update({
    where: { id: Number(id) },
    data,
    select: { id: true, name: true, email: true, role: true, active: true },
  });
  return NextResponse.json(user);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasRole("admin"))) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  const { id } = await params;
  await prisma.kullanici.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
