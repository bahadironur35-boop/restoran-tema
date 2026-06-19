import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "50");
  const odemeler = await prisma.onlineOdeme.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return NextResponse.json(odemeler);
}
