import { NextRequest, NextResponse } from "next/server";
import { checkPassword, makeSessionValue, SESSION_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
};

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  // 1. DB kullanıcısı dene (email varsa)
  if (email) {
    const user = await prisma.kullanici.findUnique({ where: { email } });
    if (user && user.active && await bcrypt.compare(password, user.password)) {
      const res = NextResponse.json({ success: true, role: user.role });
      res.cookies.set(SESSION_COOKIE, makeSessionValue(user.id, user.role as import("@/lib/auth").Role), COOKIE_OPTS);
      return res;
    }
    return NextResponse.json({ error: "E-posta veya şifre hatalı" }, { status: 401 });
  }

  // 2. Legacy tek-şifre fallback (email gönderilmemiş)
  if (!checkPassword(password)) {
    return NextResponse.json({ error: "Hatalı şifre" }, { status: 401 });
  }
  const res = NextResponse.json({ success: true, role: "admin" });
  res.cookies.set(SESSION_COOKIE, "authenticated", COOKIE_OPTS);
  return res;
}
