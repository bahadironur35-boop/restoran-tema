import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { kod, tutar } = await req.json();

  const kupon = await prisma.kupon.findUnique({ where: { kod: kod.toUpperCase().trim() } });

  if (!kupon || !kupon.aktif) return NextResponse.json({ error: "Kupon bulunamadı veya aktif değil" }, { status: 400 });
  if (kupon.gecerlilikSonu && kupon.gecerlilikSonu < new Date()) return NextResponse.json({ error: "Kuponun geçerlilik süresi dolmuş" }, { status: 400 });
  if (kupon.kullanimLimit && kupon.kullanimSayisi >= kupon.kullanimLimit) return NextResponse.json({ error: "Kupon kullanım limiti dolmuş" }, { status: 400 });
  if (kupon.minTutar && tutar < kupon.minTutar) return NextResponse.json({ error: `Minimum sepet tutarı ₺${kupon.minTutar}` }, { status: 400 });

  const indirim = kupon.tur === "yuzde" ? (tutar * kupon.deger) / 100 : kupon.deger;
  const indirimTutari = Math.min(indirim, tutar);

  // Kullanım sayısını artır
  await prisma.kupon.update({ where: { id: kupon.id }, data: { kullanimSayisi: { increment: 1 } } });

  return NextResponse.json({ kupon, indirimTutari });
}
