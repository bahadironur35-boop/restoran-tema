import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const [apiKeyRow, fromRow, nameRow, toRow] = await Promise.all([
    prisma.ayar.findUnique({ where: { key: "resendApiKey" } }),
    prisma.ayar.findUnique({ where: { key: "fromEmail" } }),
    prisma.ayar.findUnique({ where: { key: "restaurantName" } }),
    prisma.ayar.findUnique({ where: { key: "email" } }), // restoranın kendi e-postası
  ]);

  if (!apiKeyRow?.value) {
    return NextResponse.json({ skipped: "Resend API key yok" });
  }

  if (!toRow?.value) {
    return NextResponse.json({ skipped: "Bildirim e-postası (Ayarlar → E-posta) girilmemiş" });
  }

  // Kritik stok kalemleri
  const kritikler = await prisma.$queryRaw<
    { id: number; name: string; miktar: number; minMiktar: number; birim: string }[]
  >`SELECT id, name, miktar, "minMiktar", birim FROM "StokItem" WHERE miktar <= "minMiktar" ORDER BY miktar ASC`;

  if (kritikler.length === 0) {
    return NextResponse.json({ sent: false, message: "Kritik stok kalemi yok" });
  }

  const resend = new Resend(apiKeyRow.value);
  const fromEmail = fromRow?.value || "noreply@eatos.com.tr";
  const restaurantName = nameRow?.value || "EatOs";

  const satirlar = kritikler.map((k) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #E2E8F0;color:#1A2332;font-size:14px;">${k.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #E2E8F0;text-align:center;font-weight:700;color:#EF4444;font-size:14px;">${k.miktar} ${k.birim}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #E2E8F0;text-align:center;color:#64748B;font-size:14px;">${k.minMiktar} ${k.birim}</td>
    </tr>
  `).join("");

  await resend.emails.send({
    from: `${restaurantName} <${fromEmail}>`,
    to: toRow.value,
    subject: `⚠️ Kritik Stok Uyarısı — ${kritikler.length} kalem (${restaurantName})`,
    html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
      <div style="background:#0A192F;padding:32px;text-align:center;">
        <h1 style="color:#ffffff;letter-spacing:0.15em;font-size:22px;margin:0;">${restaurantName}</h1>
        <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:6px 0 0;letter-spacing:0.1em;text-transform:uppercase;">Stok Yönetimi</p>
      </div>

      <div style="padding:40px 32px;">
        <div style="display:flex;align-items:center;gap:12px;background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
          <span style="font-size:28px;">⚠️</span>
          <div>
            <p style="margin:0;font-size:15px;font-weight:700;color:#991B1B;">${kritikler.length} stok kalemi kritik seviyede</p>
            <p style="margin:4px 0 0;font-size:13px;color:#B91C1C;">Stok tükenmeden önce sipariş vermeniz önerilir.</p>
          </div>
        </div>

        <table style="width:100%;border-collapse:collapse;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;">
          <thead>
            <tr style="background:#F8FAFC;">
              <th style="padding:10px 12px;text-align:left;font-size:11px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;">Kalem</th>
              <th style="padding:10px 12px;text-align:center;font-size:11px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;">Mevcut</th>
              <th style="padding:10px 12px;text-align:center;font-size:11px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;">Minimum</th>
            </tr>
          </thead>
          <tbody>${satirlar}</tbody>
        </table>

        <div style="margin-top:28px;text-align:center;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://restoran-tema.vercel.app"}/admin/stok"
            style="display:inline-block;background:#1A73E8;color:#fff;padding:12px 28px;text-decoration:none;font-weight:600;font-size:14px;border-radius:8px;">
            Stok Yönetimine Git →
          </a>
        </div>
      </div>

      <div style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:20px 32px;text-align:center;">
        <p style="color:#94A3B8;font-size:12px;margin:0;">Bu mail ${restaurantName} yönetim paneli tarafından otomatik gönderilmiştir.</p>
      </div>
    </div>`,
  });

  return NextResponse.json({ sent: true, kritikAdet: kritikler.length });
}
