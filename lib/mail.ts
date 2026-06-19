import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

type AyarMap = Record<string, string>;

async function getMailAyarlari(): Promise<AyarMap> {
  const rows = await prisma.ayar.findMany({
    where: {
      key: {
        in: ["resendApiKey", "fromEmail", "restaurantName", "address",
          "tripadvisorUrl", "googleMapsUrl", "mailBildirimiAktif"],
      },
    },
  });
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

function getResend(ayarlar: AyarMap): Resend | null {
  if (ayarlar.mailBildirimiAktif === "false") return null;
  if (!ayarlar.resendApiKey) return null;
  return new Resend(ayarlar.resendApiKey);
}

function header(restaurantName: string) {
  return `<div style="background:#0A192F;padding:32px;text-align:center;">
    <h1 style="color:#ffffff;letter-spacing:0.15em;font-size:22px;margin:0;font-weight:700;">${restaurantName}</h1>
  </div>`;
}

function footer(restaurantName: string, address: string, fromEmail: string) {
  return `<div style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:20px 32px;text-align:center;">
    <p style="color:#94A3B8;font-size:12px;margin:0;">${restaurantName}${address ? ` · ${address}` : ""}</p>
    <p style="color:#94A3B8;font-size:12px;margin:4px 0 0;">Sorular için: <a href="mailto:${fromEmail}" style="color:#1A73E8;">${fromEmail}</a></p>
  </div>`;
}

type RezInfo = { name: string; email: string; date: string; time: string; guests: number; notes?: string | null };

export async function rezervasyonAlindi(rez: RezInfo) {
  const ayarlar = await getMailAyarlari();
  const resend = getResend(ayarlar);
  if (!resend) return;

  const rn = ayarlar.restaurantName ?? "EatOs";
  const from = ayarlar.fromEmail ?? "noreply@eatos.com.tr";

  await resend.emails.send({
    from: `${rn} <${from}>`,
    to: rez.email,
    subject: `Rezervasyon Talebiniz Alındı — ${rn}`,
    html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
      ${header(rn)}
      <div style="padding:40px 32px;">
        <div style="text-align:center;margin-bottom:32px;">
          <div style="display:inline-block;background:#F59E0B15;border:1px solid #F59E0B;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:24px;">⏳</div>
          <h2 style="color:#1A2332;font-size:20px;margin:16px 0 4px;">Talebiniz Alındı</h2>
          <p style="color:#64748B;margin:0;font-size:14px;">Rezervasyonunuz inceleniyor, kısa sürede onay maili alacaksınız.</p>
        </div>
        <div style="background:#F8FAFC;border-radius:12px;padding:24px;margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:12px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;">Misafir</p>
          <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#1A2332;">${rez.name}</p>
          <div style="display:flex;gap:24px;flex-wrap:wrap;">
            <div>
              <p style="margin:0 0 2px;font-size:12px;color:#94A3B8;text-transform:uppercase;">Tarih</p>
              <p style="margin:0;font-size:15px;font-weight:600;color:#1A2332;">${rez.date}</p>
            </div>
            <div>
              <p style="margin:0 0 2px;font-size:12px;color:#94A3B8;text-transform:uppercase;">Saat</p>
              <p style="margin:0;font-size:15px;font-weight:600;color:#1A2332;">${rez.time}</p>
            </div>
            <div>
              <p style="margin:0 0 2px;font-size:12px;color:#94A3B8;text-transform:uppercase;">Kişi</p>
              <p style="margin:0;font-size:15px;font-weight:600;color:#1A2332;">${rez.guests} kişi</p>
            </div>
          </div>
          ${rez.notes ? `<p style="margin:12px 0 0;font-size:13px;color:#64748B;">Not: ${rez.notes}</p>` : ""}
        </div>
      </div>
      ${footer(rn, ayarlar.address ?? "", from)}
    </div>`,
  }).catch(() => {});
}

export async function rezervasyonHatirlatma(rez: RezInfo) {
  const ayarlar = await getMailAyarlari();
  const resend = getResend(ayarlar);
  if (!resend) return;

  const rn = ayarlar.restaurantName ?? "EatOs";
  const from = ayarlar.fromEmail ?? "noreply@eatos.com.tr";
  const address = ayarlar.address ?? "";
  const taLink = ayarlar.tripadvisorUrl ? `${ayarlar.tripadvisorUrl}#REVIEWS` : "";
  const googleLink = ayarlar.googleMapsUrl ?? "";

  const reviewButtons = [
    taLink ? `<a href="${taLink}" style="display:inline-block;background:#00aa6c;color:#fff;padding:12px 24px;text-decoration:none;font-weight:600;font-size:14px;border-radius:8px;">🦉 TripAdvisor</a>` : "",
    googleLink ? `<a href="${googleLink}" style="display:inline-block;background:#1A73E8;color:#fff;padding:12px 24px;text-decoration:none;font-weight:600;font-size:14px;border-radius:8px;">⭐ Google</a>` : "",
  ].filter(Boolean).join('<span style="display:inline-block;width:12px;"></span>');

  await resend.emails.send({
    from: `${rn} <${from}>`,
    to: rez.email,
    subject: `Yarınki Rezervasyonunuz Hakkında — ${rn}`,
    html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
      ${header(rn)}
      <div style="padding:40px 32px;">
        <div style="text-align:center;margin-bottom:32px;">
          <div style="display:inline-block;background:#1A73E815;border:1px solid #1A73E8;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:24px;">📅</div>
          <h2 style="color:#1A2332;font-size:20px;margin:16px 0 4px;">Yarın Görüşüyoruz!</h2>
          <p style="color:#64748B;margin:0;font-size:14px;">Rezervasyonunuzu hatırlatmak istedik.</p>
        </div>
        <div style="background:#F8FAFC;border-radius:12px;padding:24px;margin-bottom:32px;">
          <p style="margin:0 0 4px;font-size:12px;color:#94A3B8;text-transform:uppercase;">Rezervasyon Detayları</p>
          <div style="display:flex;gap:24px;flex-wrap:wrap;margin-top:12px;">
            <div>
              <p style="margin:0 0 2px;font-size:12px;color:#94A3B8;text-transform:uppercase;">Tarih</p>
              <p style="margin:0;font-size:15px;font-weight:600;color:#1A2332;">${rez.date}</p>
            </div>
            <div>
              <p style="margin:0 0 2px;font-size:12px;color:#94A3B8;text-transform:uppercase;">Saat</p>
              <p style="margin:0;font-size:15px;font-weight:600;color:#1A2332;">${rez.time}</p>
            </div>
            <div>
              <p style="margin:0 0 2px;font-size:12px;color:#94A3B8;text-transform:uppercase;">Kişi</p>
              <p style="margin:0;font-size:15px;font-weight:600;color:#1A2332;">${rez.guests} kişi</p>
            </div>
          </div>
          ${address ? `<p style="margin:12px 0 0;font-size:13px;color:#64748B;">📍 ${address}</p>` : ""}
        </div>
        ${reviewButtons ? `
        <div style="text-align:center;padding:24px;background:#F0F4F8;border-radius:12px;">
          <p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#1A2332;">Ziyaretinizden Sonra Yorum Yazın</p>
          <p style="margin:0 0 16px;font-size:13px;color:#64748B;">Deneyiminizi paylaşmak bize büyük destek olur.</p>
          ${reviewButtons}
        </div>` : ""}
      </div>
      ${footer(rn, address, from)}
    </div>`,
  }).catch(() => {});
}
