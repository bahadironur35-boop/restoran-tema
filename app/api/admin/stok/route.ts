import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const items = await prisma.stokItem.findMany({
    include: { hareketler: { orderBy: { createdAt: "desc" }, take: 5 } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { name, birim, miktar, minMiktar, kategori } = await req.json();
  const item = await prisma.stokItem.create({
    data: { name, birim, miktar: Number(miktar), minMiktar: Number(minMiktar), kategori },
  });
  return NextResponse.json(item);
}
