import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const musteriler = await prisma.musteri.findMany({
    include: { ziyaretler: true, rezervasyonlar: { where: { status: "onaylandi" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(musteriler);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const body = await req.json();
  const musteri = await prisma.musteri.upsert({
    where: { email: body.email },
    update: { name: body.name, phone: body.phone, dogumGunu: body.dogumGunu, notlar: body.notlar },
    create: { name: body.name, email: body.email, phone: body.phone, dogumGunu: body.dogumGunu, notlar: body.notlar },
    include: { ziyaretler: true, rezervasyonlar: true },
  });
  return NextResponse.json(musteri);
}
