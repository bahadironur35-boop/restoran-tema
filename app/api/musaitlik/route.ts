import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_PER_SLOT = 3; // Aynı saatte maksimum rezervasyon

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json({});

  const rezervasyonlar = await prisma.rezervasyon.findMany({
    where: { date, status: { not: "reddedildi" } },
    select: { time: true },
  });

  const sayac: Record<string, number> = {};
  for (const r of rezervasyonlar) {
    sayac[r.time] = (sayac[r.time] ?? 0) + 1;
  }

  const dolu: Record<string, boolean> = {};
  for (const [saat, adet] of Object.entries(sayac)) {
    dolu[saat] = adet >= MAX_PER_SLOT;
  }

  return NextResponse.json({ dolu, sayac });
}
