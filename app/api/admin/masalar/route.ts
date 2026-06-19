import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  // Saati gelmiş onaylı rezervasyonları otomatik "dolu" yap
  const simdi = new Date();
  const onayliRezervasyonlar = await prisma.rezervasyon.findMany({
    where: { status: "onaylandi", masaId: { not: null } },
    select: { masaId: true, date: true, time: true },
  });
  for (const r of onayliRezervasyonlar) {
    if (!r.masaId) continue;
    const rezervasyonZamani = new Date(`${r.date}T${r.time}:00`);
    if (rezervasyonZamani <= simdi) {
      await prisma.masa.updateMany({
        where: { id: r.masaId, durum: "rezerveli" },
        data: { durum: "dolu" },
      });
    }
  }

  const masalar = await prisma.masa.findMany({
    include: {
      talepler: { where: { durum: "bekliyor" }, orderBy: { createdAt: "asc" } },
    },
    orderBy: [{ alan: "asc" }, { no: "asc" }],
  });
  return NextResponse.json(masalar);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { no, kapasite, alan } = await req.json();
  const masa = await prisma.masa.create({
    data: { no: Number(no), kapasite: Number(kapasite), alan: alan || "Salon" },
  });
  return NextResponse.json(masa);
}
