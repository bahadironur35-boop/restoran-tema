import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOdemeAdapter } from "@/lib/odeme";
import type { OdemeProvider } from "@/lib/odeme";

// Stripe: POST ile raw body + signature header
// İyzico: POST ile form body (token)
export async function POST(req: NextRequest) {
  const provider = (req.nextUrl.searchParams.get("provider") ?? "iyzico") as OdemeProvider;
  const adapter = getOdemeAdapter(provider);

  let payload: unknown;
  let signature: string | undefined;

  if (provider === "stripe") {
    payload = await req.text(); // Stripe raw body ister
    signature = req.headers.get("stripe-signature") ?? undefined;
  } else {
    try { payload = await req.json(); } catch { payload = Object.fromEntries(await req.formData()); }
  }

  const sonuc = await adapter.webhookDogrula(payload, signature);

  if (!sonuc.referansId) {
    return NextResponse.json({ ok: false, hata: sonuc.hata }, { status: 400 });
  }

  const odeme = await prisma.onlineOdeme.findUnique({ where: { referansId: sonuc.referansId } });
  if (!odeme) return NextResponse.json({ ok: false, hata: "Ödeme bulunamadı" }, { status: 404 });

  await prisma.onlineOdeme.update({
    where: { id: odeme.id },
    data: {
      durum: sonuc.durum,
      externalId: sonuc.externalId ?? odeme.externalId,
      errorMsg: sonuc.hata,
    },
  });

  // Ödeme tamamlandıysa ilgili kaydı güncelle
  if (sonuc.durum === "tamamlandi") {
    if (odeme.masaId) {
      // Masa ödemesini Odeme tablosuna ekle (kasa akışıyla uyumlu)
      await prisma.odeme.create({
        data: {
          masaId: odeme.masaId,
          tutar: odeme.tutar,
          yontem: provider === "stripe" ? "stripe" : "iyzico",
          notlar: `Online ödeme · ref: ${sonuc.referansId}`,
        },
      });
    }
    if (odeme.teslimatId) {
      await prisma.teslimatSiparis.update({
        where: { id: odeme.teslimatId },
        data: { durum: "hazirlaniyor" }, // ödeme alındı, hazırlanmaya başlasın
      });
    }
  }

  return NextResponse.json({ ok: true });
}
