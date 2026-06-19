import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.menuItem.findMany({
    where: { active: true },
    orderBy: [{ category: "asc" }, { order: "asc" }],
    select: { id: true, name: true, desc: true, price: true, category: true, image: true, happyHourPrice: true },
  });
  return NextResponse.json(items);
}
