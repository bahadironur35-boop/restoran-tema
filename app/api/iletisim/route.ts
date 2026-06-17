import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, message } = body;

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Zorunlu alanlar eksik" }, { status: 400 });
  }

  // E-posta gönderimi burada yapılır
  console.log("Yeni iletişim mesajı:", { name, email, message });

  return NextResponse.json({ success: true });
}
