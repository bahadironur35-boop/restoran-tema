import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, date, time, guests, notes } = body;

  if (!name || !email || !phone || !date || !time) {
    return NextResponse.json({ error: "Zorunlu alanlar eksik" }, { status: 400 });
  }

  const rezervasyon = await prisma.rezervasyon.create({
    data: { name, email, phone, date, time, guests: Number(guests), notes },
  });

  return NextResponse.json({ success: true, id: rezervasyon.id });
}
