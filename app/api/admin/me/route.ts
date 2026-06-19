import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  if (session.userId) {
    const user = await prisma.kullanici.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true, role: true },
    });
    return NextResponse.json(user ?? { name: "Kullanıcı", email: "", role: session.role });
  }

  // Legacy admin
  return NextResponse.json({ name: "Admin", email: "", role: "admin" });
}
