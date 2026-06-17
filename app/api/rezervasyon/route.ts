import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, date, time, guests, notes } = body;

  if (!name || !email || !phone || !date || !time) {
    return NextResponse.json({ error: "Zorunlu alanlar eksik" }, { status: 400 });
  }

  // E-posta gönderimi burada yapılır (nodemailer veya Resend API)
  // Örnek: await sendReservationEmail({ name, email, phone, date, time, guests, notes });

  console.log("Yeni rezervasyon:", { name, email, phone, date, time, guests, notes });

  return NextResponse.json({ success: true });
}
