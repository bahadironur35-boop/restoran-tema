import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasRole("admin", "mudur"))) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const data = await req.json();
  const kupon = await prisma.kupon.update({
    where: { id: parseInt((await params).id) },
    data: {
      aktif: data.aktif !== undefined ? data.aktif : undefined,
      kullanimLimit: data.kullanimLimit !== undefined ? (data.kullanimLimit ? parseInt(data.kullanimLimit) : null) : undefined,
    },
  });
  return NextResponse.json(kupon);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasRole("admin", "mudur"))) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  await prisma.kupon.delete({ where: { id: parseInt((await params).id) } });
  return NextResponse.json({ ok: true });
}
