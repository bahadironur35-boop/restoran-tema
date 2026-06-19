import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

function parsePrice(p: string): number {
  return parseFloat(p.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
}

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const masalar = await prisma.masa.findMany({
    where: { durum: "dolu" },
    include: {
      siparisler: {
        where: { durum: { not: "teslim" } },
        include: { items: true },
      },
    },
    orderBy: [{ alan: "asc" }, { no: "asc" }],
  });

  const result = masalar
    .filter((m) => m.siparisler.length > 0)
    .map((m) => {
      const tumItems = m.siparisler.flatMap((s) => s.items);
      const tutar = tumItems.reduce((sum, i) => sum + parsePrice(i.price) * i.adet, 0);
      return {
        id: m.id, no: m.no, alan: m.alan,
        siparisler: m.siparisler,
        tutar,
      };
    });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { masaId, tutar, yontem, notlar } = await req.json();

  await prisma.$transaction([
    prisma.odeme.create({ data: { masaId, tutar, yontem, notlar: notlar || null } }),
    prisma.siparis.updateMany({ where: { masaId, durum: { not: "teslim" } }, data: { durum: "teslim" } }),
    prisma.masa.update({ where: { id: masaId }, data: { durum: "bos" } }),
  ]);

  return NextResponse.json({ success: true });
}
