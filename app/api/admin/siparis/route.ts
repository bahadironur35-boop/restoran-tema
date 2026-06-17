import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const siparisler = await prisma.siparis.findMany({
    where: { durum: { not: "teslim" } },
    include: { items: true, masa: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(siparisler);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { masaId, items, notlar } = await req.json();
  const siparis = await prisma.siparis.create({
    data: {
      masaId: Number(masaId),
      notlar,
      items: { create: items },
    },
    include: { items: true, masa: true },
  });
  return NextResponse.json(siparis);
}
