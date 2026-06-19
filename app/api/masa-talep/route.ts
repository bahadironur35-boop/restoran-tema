import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pushGonder } from "@/lib/push";

export async function POST(req: NextRequest) {
  const { masaId, tip } = await req.json();
  if (!masaId || !tip) return NextResponse.json({ error: "Eksik alan" }, { status: 400 });

  const [talep, masa] = await Promise.all([
    prisma.masaTalebi.create({ data: { masaId: Number(masaId), tip } }),
    prisma.masa.findUnique({ where: { id: Number(masaId) }, select: { no: true } }),
  ]);

  // Garsonlara push bildirim
  const masaNo = masa?.no ?? masaId;
  pushGonder("garson", {
    title: tip === "hesap" ? "💳 Hesap İsteniyor" : "🔔 Garson Çağrısı",
    body: `Masa ${masaNo} — ${tip === "hesap" ? "hesap istiyor" : "garson çağırıyor"}`,
    url: "/garson",
  }).catch(() => {});

  return NextResponse.json(talep);
}
