import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const val = req.cookies.get("admin_session")?.value;
    const valid = val === "authenticated" || (!!val && val.includes("|"));
    if (!valid) {
      return NextResponse.rewrite(new URL("/_not-found", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
