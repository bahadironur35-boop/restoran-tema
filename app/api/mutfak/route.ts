import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const siparisler = await prisma.siparis.findMany({
    where: { durum: { in: ["bekliyor", "hazirlaniyor"] } },
    include: { items: true, masa: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(siparisler);
}

export async function PATCH(req: Request) {
  const { id, durum } = await req.json();
  const siparis = await prisma.siparis.update({
    where: { id: Number(id) },
    data: { durum },
    include: { items: true, masa: true },
  });
  return NextResponse.json(siparis);
}
