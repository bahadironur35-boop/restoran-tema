import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/auth";

export async function GET() {
  if (!(await hasRole("admin", "mudur"))) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const kuponlar = await prisma.kupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(kuponlar);
}

export async function POST(req: Request) {
  if (!(await hasRole("admin", "mudur"))) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { kod, tur, deger, minTutar, kullanimLimit, gecerlilikSonu } = await req.json();
  const kupon = await prisma.kupon.create({
    data: {
      kod: kod.toUpperCase().trim(),
      tur,
      deger: parseFloat(deger),
      minTutar: minTutar ? parseFloat(minTutar) : null,
      kullanimLimit: kullanimLimit ? parseInt(kullanimLimit) : null,
      gecerlilikSonu: gecerlilikSonu ? new Date(gecerlilikSonu) : null,
    },
  });
  return NextResponse.json(kupon);
}
