import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await params;
  const masaId = Number(id);

  await prisma.$transaction([
    prisma.siparis.updateMany({
      where: { masaId, durum: { not: "teslim" } },
      data: { durum: "teslim" },
    }),
    prisma.masa.update({
      where: { id: masaId },
      data: { durum: "bos" },
    }),
  ]);

  return NextResponse.json({ success: true });
}
