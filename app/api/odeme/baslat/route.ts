import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOdemeAdapter, getAktifProvider } from "@/lib/odeme";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    tutar: number;
    musteriAdi: string;
    musteriEmail: string;
    musteriTelefon?: string;
    masaId?: number;
    teslimatId?: number;
    rezervasyonId?: number;
    aciklama?: string;
  };

  const { tutar, musteriAdi, musteriEmail, musteriTelefon, masaId, teslimatId, rezervasyonId } = body;

  if (!tutar || !musteriAdi || !musteriEmail) {
    return NextResponse.json({ error: "tutar, musteriAdi ve musteriEmail zorunlu" }, { status: 400 });
  }

  const provider = getAktifProvider();
  const referansId = randomUUID();

  // Ayarlar'dan restoran adını al
  const ayar = await prisma.ayar.findUnique({ where: { key: "restaurantName" } });
  const restaurantName = ayar?.value ?? "EatOs";

  const aciklama = body.aciklama
    ?? (masaId ? `Masa ${masaId} - ${restaurantName}` : `Sipariş - ${restaurantName}`);

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_URL ?? "";
  const callbackUrl = `${origin}/odeme/sonuc`;

  // DB kaydı oluştur
  const odeme = await prisma.onlineOdeme.create({
    data: {
      provider,
      referansId,
      tutar,
      masaId,
      teslimatId,
      rezervasyonId,
      musteriAdi,
      musteriEmail,
      musteriTelefon,
      callbackUrl,
    },
  });

  const adapter = getOdemeAdapter(provider);
  const ipAdresi = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";

  const sonuc = await adapter.odemeBaslat({
    referansId,
    tutar,
    musteriAdi,
    musteriEmail,
    musteriTelefon,
    aciklama,
    callbackUrl,
    ipAdresi,
  });

  if (!sonuc.ok) {
    await prisma.onlineOdeme.update({
      where: { id: odeme.id },
      data: { durum: "basarisiz", errorMsg: sonuc.hata },
    });
    return NextResponse.json({ error: sonuc.hata }, { status: 502 });
  }

  // externalId'yi kaydet
  if (sonuc.externalId) {
    await prisma.onlineOdeme.update({
      where: { id: odeme.id },
      data: { externalId: sonuc.externalId },
    });
  }

  return NextResponse.json({
    referansId,
    provider,
    odemeUrl: sonuc.odemeUrl,
    checkoutFormHtml: sonuc.checkoutFormHtml,
  });
}
