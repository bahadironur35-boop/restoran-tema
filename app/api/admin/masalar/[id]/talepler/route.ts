import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

// Bekleyen tüm talepleri "goruldu" yap
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  await prisma.masaTalebi.updateMany({
    where: { masaId: parseInt((await params).id), durum: "bekliyor" },
    data: { durum: "goruldu" },
  });
  return NextResponse.json({ ok: true });
}
