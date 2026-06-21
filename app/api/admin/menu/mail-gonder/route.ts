import { NextRequest, NextResponse } from "next/server";
import { hasRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  if (!(await hasRole("admin", "mudur"))) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { email, imageBase64, restoranAdi } = await req.json();
  if (!email || !imageBase64) return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });

  const ayarlar = await prisma.ayar.findMany({
    where: { key: { in: ["resendApiKey", "fromEmail", "restaurantName"] } },
  });
  const a = Object.fromEntries(ayarlar.map((r) => [r.key, r.value]));

  if (!a.resendApiKey) return NextResponse.json({ error: "Resend API anahtarı ayarlanmamış" }, { status: 500 });

  const resend = new Resend(a.resendApiKey);
  const rn = restoranAdi || a.restaurantName || "Restoran";
  const from = a.fromEmail || "noreply@eatos.com.tr";

  // base64 → buffer
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  const result = await resend.emails.send({
    from: `${rn} <${from}>`,
    to: email,
    subject: `${rn} — Menümüz`,
    html: `<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#0A192F;padding:28px;text-align:center;">
        <h1 style="color:#fff;margin:0;letter-spacing:0.15em;font-size:20px;">${rn}</h1>
      </div>
      <div style="padding:32px;text-align:center;">
        <p style="color:#374151;font-size:15px;margin:0 0 8px;">Güncel menümüzü sizinle paylaşmak istedik.</p>
        <p style="color:#6B7280;font-size:13px;margin:0;">Menü görselini ekteki dosyada bulabilirsiniz.</p>
      </div>
      <div style="background:#F9FAFB;padding:16px;text-align:center;border-top:1px solid #E5E7EB;">
        <p style="color:#9CA3AF;font-size:11px;margin:0;">${rn}</p>
      </div>
    </div>`,
    attachments: [
      { filename: "menu.png", content: buffer },
    ],
  });

  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
