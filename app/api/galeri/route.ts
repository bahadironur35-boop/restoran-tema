import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.galeriItem.findMany({
    orderBy: { order: "asc" },
    select: { id: true, url: true, alt: true },
  });
  return NextResponse.json(items);
}
