import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Abonelik kaydet (garson veya müşteri)
export async function POST(req: NextRequest) {
  const { subscription, tip, masaId } = await req.json();
  if (!subscription?.endpoint) return NextResponse.json({ error: "Geçersiz abonelik" }, { status: 400 });

  await prisma.pushAbonelik.upsert({
    where: { endpoint: subscription.endpoint },
    update: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth, tip, masaId: masaId ?? null },
    create: {
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      tip: tip ?? "garson",
      masaId: masaId ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}

// Abonelik sil
export async function DELETE(req: NextRequest) {
  const { endpoint } = await req.json();
  if (endpoint) {
    await prisma.pushAbonelik.deleteMany({ where: { endpoint } }).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
