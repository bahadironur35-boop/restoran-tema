import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.menuItem.findMany({
    where: { active: true },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });
  return NextResponse.json(items);
}
