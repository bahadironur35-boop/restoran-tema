import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  if (!(await hasRole("admin"))) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  const users = await prisma.kullanici.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  if (!(await hasRole("admin"))) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  const { name, email, password, role } = await req.json();
  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Tüm alanlar zorunlu" }, { status: 400 });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.kullanici.create({
    data: { name, email, password: hashed, role },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
  return NextResponse.json(user);
}
