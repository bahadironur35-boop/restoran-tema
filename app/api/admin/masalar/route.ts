import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const masalar = await prisma.masa.findMany({
    include: {
      talepler: { where: { durum: "bekliyor" }, orderBy: { createdAt: "asc" } },
    },
    orderBy: { no: "asc" },
  });
  return NextResponse.json(masalar);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { no, kapasite } = await req.json();
  const masa = await prisma.masa.create({ data: { no: Number(no), kapasite: Number(kapasite) } });
  return NextResponse.json(masa);
}
