import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

  const rezervasyonlar = await prisma.rezervasyon.findMany({
    where: { date: { gte: startDate, lte: endDate } },
    orderBy: { time: "asc" },
    select: { id: true, name: true, date: true, time: true, guests: true, status: true },
  });

  // Günlere göre grupla
  const byDate: Record<string, typeof rezervasyonlar> = {};
  for (const r of rezervasyonlar) {
    if (!byDate[r.date]) byDate[r.date] = [];
    byDate[r.date].push(r);
  }

  return NextResponse.json(byDate);
}
