import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

export async function GET(req: NextRequest) {
  // Vercel Cron güvenlik kontrolü
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const [apiKeyRow, fromRow, nameRow, addressRow] = await Promise.all([
    prisma.ayar.findUnique({ where: { key: "resendApiKey" } }),
    prisma.ayar.findUnique({ where: { key: "fromEmail" } }),
    prisma.ayar.findUnique({ where: { key: "restaurantName" } }),
    prisma.ayar.findUnique({ where: { key: "address" } }),
  ]);

  if (!apiKeyRow?.value) {
    return NextResponse.json({ skipped: "Resend API key yok" });
  }

  const bugun = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const rezervasyonlar = await prisma.rezervasyon.findMany({
    where: { date: bugun, status: "onaylandi" },
  });

  if (rezervasyonlar.length === 0) {
    return NextResponse.json({ sent: 0, message: "Bugün onaylı rezervasyon yok" });
  }

  const resend = new Resend(apiKeyRow.value);
  const fromEmail = fromRow?.value || "noreply@eatos.com.tr";
  const restaurantName = nameRow?.value || "EatOs";
  const address = addressRow?.value || "";

  let sent = 0;
  const errors: string[] = [];

  for (const r of rezervasyonlar) {
    try {
      await resend.emails.send({
        from: `${restaurantName} <${fromEmail}>`,
        to: r.email,
        subject: `Bugün rezervasyonunuz var — ${restaurantName}`,
        html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
          <div style="background:#0A192F;padding:32px;text-align:center;">
            <h1 style="color:#ffffff;letter-spacing:0.15em;font-size:22px;margin:0;font-weight:700;">${restaurantName}</h1>
          </div>
          <div style="padding:40px 32px;">
            <h2 style="color:#1A2332;font-size:18px;margin:0 0 8px;">Merhaba ${r.name},</h2>
            <p style="color:#64748B;font-size:14px;line-height:1.6;margin:0 0 24px;">
              Bugün için rezervasyonunuzu hatırlatmak istedik. Sizi aramızda görmekten mutluluk duyacağız!
            </p>

            <div style="background:#F8FAFC;border-radius:12px;padding:24px;margin-bottom:32px;">
              <div style="display:flex;gap:24px;flex-wrap:wrap;">
                <div>
                  <p style="margin:0 0 2px;font-size:12px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;">Tarih</p>
                  <p style="margin:0;font-size:16px;font-weight:700;color:#1A2332;">${r.date}</p>
                </div>
                <div>
                  <p style="margin:0 0 2px;font-size:12px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;">Saat</p>
                  <p style="margin:0;font-size:16px;font-weight:700;color:#1A2332;">${r.time}</p>
                </div>
                <div>
                  <p style="margin:0 0 2px;font-size:12px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;">Kişi</p>
                  <p style="margin:0;font-size:16px;font-weight:700;color:#1A2332;">${r.guests} kişi</p>
                </div>
              </div>
            </div>

            ${address ? `<p style="color:#64748B;font-size:13px;">📍 ${address}</p>` : ""}
            <p style="color:#64748B;font-size:13px;margin-top:8px;">
              Gelemeyecekseniz lütfen önceden haber verin: <a href="mailto:${fromEmail}" style="color:#1A73E8;">${fromEmail}</a>
            </p>
          </div>
          <div style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:20px 32px;text-align:center;">
            <p style="color:#94A3B8;font-size:12px;margin:0;">${restaurantName}${address ? ` · ${address}` : ""}</p>
          </div>
        </div>`,
      });
      sent++;
    } catch (e) {
      errors.push(`${r.email}: ${e}`);
    }
  }

  return NextResponse.json({ sent, total: rezervasyonlar.length, errors });
}
