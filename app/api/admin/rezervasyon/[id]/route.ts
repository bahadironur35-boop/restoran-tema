import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { Resend } from "resend";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await params;
  const { status, masaId } = await req.json();
  const rezervasyon = await prisma.rezervasyon.findUnique({ where: { id: Number(id) } });
  if (!rezervasyon) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  const updateData: Record<string, unknown> = { status };
  if (masaId !== undefined) updateData.masaId = masaId || null;

  const updated = await prisma.rezervasyon.update({ where: { id: Number(id) }, data: updateData });

  // Masa durum yönetimi
  const hedefMasaId = masaId ?? rezervasyon.masaId;
  if (hedefMasaId) {
    if (status === "onaylandi") {
      await prisma.masa.update({ where: { id: hedefMasaId }, data: { durum: "rezerveli" } });
    } else if (status === "reddedildi") {
      await prisma.masa.update({ where: { id: hedefMasaId }, data: { durum: "bos" } });
    }
  }
  // Önceki masa varsa ve değiştiriliyorsa eski masayı boşalt
  if (masaId !== undefined && rezervasyon.masaId && rezervasyon.masaId !== masaId) {
    await prisma.masa.update({ where: { id: rezervasyon.masaId }, data: { durum: "bos" } });
  }

  // Onaylandığında müşteriyi CRM'e ekle / güncelle
  if (status === "onaylandi") {
    const musteri = await prisma.musteri.upsert({
      where: { email: rezervasyon.email },
      update: { name: rezervasyon.name, phone: rezervasyon.phone },
      create: { name: rezervasyon.name, email: rezervasyon.email, phone: rezervasyon.phone },
    });
    await prisma.rezervasyon.update({ where: { id: Number(id) }, data: { musteriId: musteri.id } });
    await prisma.musteriZiyaret.create({
      data: { musteriId: musteri.id, tarih: rezervasyon.date, kisiSayisi: rezervasyon.guests, not: rezervasyon.notes },
    });

    // Otomatik yorum isteği e-postası gönder
    try {
      const [apiKeyRow, fromRow, taRow, googleRow, nameRow, addressRow] = await Promise.all([
        prisma.ayar.findUnique({ where: { key: "resendApiKey" } }),
        prisma.ayar.findUnique({ where: { key: "fromEmail" } }),
        prisma.ayar.findUnique({ where: { key: "tripadvisorUrl" } }),
        prisma.ayar.findUnique({ where: { key: "googleMapsUrl" } }),
        prisma.ayar.findUnique({ where: { key: "restaurantName" } }),
        prisma.ayar.findUnique({ where: { key: "address" } }),
      ]);
      if (apiKeyRow?.value) {
        const resend = new Resend(apiKeyRow.value);
        const fromEmail = fromRow?.value || "noreply@eatos.com.tr";
        const restaurantName = nameRow?.value || "EatOs";
        const address = addressRow?.value || "";
        const taLink = taRow?.value ? `${taRow.value}#REVIEWS` : "";
        const googleLink = googleRow?.value || "";

        const reviewButtons = [
          taLink ? `<a href="${taLink}" style="display:inline-block;background:#00aa6c;color:#fff;padding:12px 28px;text-decoration:none;font-weight:600;font-size:14px;border-radius:8px;">🦉 TripAdvisor'da Yorum Yaz</a>` : "",
          googleLink ? `<a href="${googleLink}" style="display:inline-block;background:#1A73E8;color:#fff;padding:12px 28px;text-decoration:none;font-weight:600;font-size:14px;border-radius:8px;">⭐ Google'da Yorum Yaz</a>` : "",
        ].filter(Boolean).join('<span style="display:inline-block;width:12px;"></span>');

        await resend.emails.send({
          from: `${restaurantName} <${fromEmail}>`,
          to: rezervasyon.email,
          subject: `Rezervasyonunuz Onaylandı — ${restaurantName}`,
          html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
            <div style="background:#0A192F;padding:32px;text-align:center;">
              <h1 style="color:#ffffff;letter-spacing:0.15em;font-size:22px;margin:0;font-weight:700;">${restaurantName}</h1>
              <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:6px 0 0;letter-spacing:0.1em;text-transform:uppercase;">Restaurant & Bar</p>
            </div>
            <div style="padding:40px 32px;">
              <div style="text-align:center;margin-bottom:32px;">
                <div style="display:inline-block;background:#22C55E15;border:1px solid #22C55E;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:24px;">✓</div>
                <h2 style="color:#1A2332;font-size:20px;margin:16px 0 4px;">Rezervasyonunuz Onaylandı</h2>
                <p style="color:#64748B;margin:0;font-size:14px;">Sizi aramızda görmekten mutluluk duyacağız</p>
              </div>

              <div style="background:#F8FAFC;border-radius:12px;padding:24px;margin-bottom:32px;">
                <p style="margin:0 0 4px;font-size:12px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;">Misafir</p>
                <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#1A2332;">${rezervasyon.name}</p>
                <div style="display:flex;gap:24px;flex-wrap:wrap;">
                  <div>
                    <p style="margin:0 0 2px;font-size:12px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;">Tarih</p>
                    <p style="margin:0;font-size:15px;font-weight:600;color:#1A2332;">${rezervasyon.date}</p>
                  </div>
                  <div>
                    <p style="margin:0 0 2px;font-size:12px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;">Saat</p>
                    <p style="margin:0;font-size:15px;font-weight:600;color:#1A2332;">${rezervasyon.time}</p>
                  </div>
                  <div>
                    <p style="margin:0 0 2px;font-size:12px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.08em;">Kişi</p>
                    <p style="margin:0;font-size:15px;font-weight:600;color:#1A2332;">${rezervasyon.guests} kişi</p>
                  </div>
                </div>
              </div>

              ${reviewButtons ? `
              <div style="text-align:center;padding:28px;background:#F0F4F8;border-radius:12px;margin-bottom:32px;">
                <p style="margin:0 0 6px;font-size:16px;font-weight:600;color:#1A2332;">Deneyiminizi Paylaşın</p>
                <p style="margin:0 0 20px;font-size:13px;color:#64748B;">Yorumlarınız diğer misafirlere rehber olur ve bizi motive eder.</p>
                ${reviewButtons}
              </div>` : ""}

              <p style="color:#94A3B8;font-size:12px;text-align:center;margin:0;">Sorularınız için: <a href="mailto:${fromEmail}" style="color:#1A73E8;">${fromEmail}</a></p>
            </div>
            <div style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:20px 32px;text-align:center;">
              <p style="color:#94A3B8;font-size:12px;margin:0;">${restaurantName}${address ? ` · ${address}` : ""}</p>
            </div>
          </div>`,
        });
      }
    } catch {
      // e-posta hatası rezervasyon onayını bloklamasın
    }
  }

  // Red maili
  if (status === "reddedildi") {
    try {
      const [apiKeyRow, fromRow, nameRow] = await Promise.all([
        prisma.ayar.findUnique({ where: { key: "resendApiKey" } }),
        prisma.ayar.findUnique({ where: { key: "fromEmail" } }),
        prisma.ayar.findUnique({ where: { key: "restaurantName" } }),
      ]);
      if (apiKeyRow?.value) {
        const resend = new Resend(apiKeyRow.value);
        const fromEmail = fromRow?.value || "noreply@eatos.com.tr";
        const restaurantName = nameRow?.value || "EatOs";
        await resend.emails.send({
          from: `${restaurantName} <${fromEmail}>`,
          to: rezervasyon.email,
          subject: `Rezervasyon Talebi — ${restaurantName}`,
          html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#0A192F;padding:32px;text-align:center;">
              <h1 style="color:#fff;letter-spacing:0.15em;font-size:22px;margin:0;">${restaurantName}</h1>
            </div>
            <div style="padding:40px 32px;">
              <p style="font-size:16px;color:#1A2332;">Sayın ${rezervasyon.name},</p>
              <p style="color:#64748B;font-size:14px;line-height:1.6;">
                ${rezervasyon.date} tarihli, saat ${rezervasyon.time} için yaptığınız ${rezervasyon.guests} kişilik rezervasyon talebinizi
                maalesef karşılayamıyoruz. Uygunsuzluk yarattığımız için özür dileriz.
              </p>
              <p style="color:#64748B;font-size:14px;line-height:1.6;">
                Farklı bir tarih veya saat için rezervasyon yapmak isterseniz lütfen tekrar deneyin ya da bizi arayın.
              </p>
              <p style="color:#94A3B8;font-size:12px;margin-top:32px;">Anlayışınız için teşekkür ederiz.</p>
            </div>
          </div>`,
        });
      }
    } catch {
      // e-posta hatası işlemi bloklamasın
    }
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await params;
  const rezervasyon = await prisma.rezervasyon.findUnique({ where: { id: Number(id) } });
  if (rezervasyon?.masaId) {
    await prisma.masa.update({ where: { id: rezervasyon.masaId }, data: { durum: "bos" } });
  }
  await prisma.rezervasyon.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
