import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const secret = process.env.SUPER_ADMIN_PW;
  if (!secret) return NextResponse.json({ error: "SUPER_ADMIN_PW not set" }, { status: 400 });

  try {
    // isSuperAdmin kolonu yoksa ekle (Neon destekler)
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Kullanici" ADD COLUMN IF NOT EXISTS "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false;
    `);

    const hash = await bcrypt.hash(secret, 10);
    await prisma.kullanici.upsert({
      where: { email: "bahadironur35@gmail.com" },
      update: { password: hash, isSuperAdmin: true, active: true, role: "admin", name: "Onur Bahadir" },
      create: { email: "bahadironur35@gmail.com", password: hash, isSuperAdmin: true, active: true, role: "admin", name: "Onur Bahadir" },
    });

    return NextResponse.json({ ok: true, message: "SuperAdmin hazır" });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
