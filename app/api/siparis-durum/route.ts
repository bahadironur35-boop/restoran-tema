import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const masaId = req.nextUrl.searchParams.get("masaId");
  if (!masaId) return NextResponse.json({ hazir: false });

  const hazirSiparis = await prisma.siparis.findFirst({
    where: { masaId: Number(masaId), durum: "hazir" },
  });

  const bildirimAyar = await prisma.ayar.findUnique({
    where: { key: "musteriSiparisHazirBildirimi" },
  });

  const bildirimAktif = bildirimAyar?.value === "true";

  return NextResponse.json({ hazir: bildirimAktif && !!hazirSiparis });
}
