import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ayarlar = await prisma.ayar.findMany();
  const obj: Record<string, string> = {};
  for (const a of ayarlar) obj[a.key] = a.value;
  return NextResponse.json(obj);
}

export async function POST(req: Request) {
  const body = await req.json();
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === "string") {
      await prisma.ayar.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
  }
  return NextResponse.json({ ok: true });
}
