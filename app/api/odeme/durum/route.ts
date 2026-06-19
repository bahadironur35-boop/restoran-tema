import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");
  if (!ref) return NextResponse.json({ error: "ref zorunlu" }, { status: 400 });

  const odeme = await prisma.onlineOdeme.findUnique({
    where: { referansId: ref },
    select: { durum: true, tutar: true, provider: true, musteriAdi: true, createdAt: true },
  });

  if (!odeme) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(odeme);
}
