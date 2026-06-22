import { NextRequest, NextResponse } from "next/server";
import { checkPassword, SESSION_COOKIE, SUPERADMIN_VALUE } from "@/lib/auth";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
};

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  // SuperAdmin: email + şifre ile direkt env var kontrolü
  const saEmail = process.env.SUPER_ADMIN_EMAIL ?? "bahadironur35@gmail.com";
  const saPw = process.env.SUPER_ADMIN_PW ?? process.env.SUPER_ADMIN_PASSWORD;
  if (email && email === saEmail && saPw && password === saPw) {
    const res = NextResponse.json({ success: true, role: "superadmin" });
    res.cookies.set(SESSION_COOKIE, SUPERADMIN_VALUE, COOKIE_OPTS);
    return res;
  }

  // Normal admin şifresi (email boş)
  if (!email && checkPassword(password)) {
    const res = NextResponse.json({ success: true, role: "admin" });
    res.cookies.set(SESSION_COOKIE, "authenticated", COOKIE_OPTS);
    return res;
  }

  return NextResponse.json({ error: "Hatalı giriş bilgileri" }, { status: 401 });
}
