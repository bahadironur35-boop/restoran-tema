import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const body = await req.json();
  const item = await prisma.menuItem.create({ data: body });
  return NextResponse.json(item);
}
