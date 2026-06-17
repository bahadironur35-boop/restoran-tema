import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { masaId, tip } = await req.json();
  if (!masaId || !tip) return NextResponse.json({ error: "Eksik alan" }, { status: 400 });

  const talep = await prisma.masaTalebi.create({
    data: { masaId: Number(masaId), tip },
  });
  return NextResponse.json(talep);
}
