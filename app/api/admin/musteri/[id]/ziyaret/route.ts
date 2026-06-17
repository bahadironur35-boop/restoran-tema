import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await params;
  const { tarih, kisiSayisi, not } = await req.json();
  const ziyaret = await prisma.musteriZiyaret.create({
    data: { musteriId: Number(id), tarih, kisiSayisi: Number(kisiSayisi), not },
  });
  return NextResponse.json(ziyaret);
}
