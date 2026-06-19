import webpush from "web-push";
import { prisma } from "@/lib/prisma";

function getWebpush() {
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return null;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:admin@eatos.app",
    pub,
    priv,
  );
  return webpush;
}

export async function pushGonder(tip: "garson" | "musteri", payload: object, masaId?: number) {
  const wp = getWebpush();
  if (!wp) return [];
  const where = masaId
    ? { tip, masaId }
    : { tip };

  const abonelikler = await prisma.pushAbonelik.findMany({ where });

  const sonuclar = await Promise.allSettled(
    abonelikler.map(async (a) => {
      try {
        await wp.sendNotification(
          { endpoint: a.endpoint, keys: { p256dh: a.p256dh, auth: a.auth } },
          JSON.stringify(payload),
        );
      } catch (err: unknown) {
        // 410 Gone = abonelik iptal edilmiş, sil
        if ((err as { statusCode?: number }).statusCode === 410) {
          await prisma.pushAbonelik.deleteMany({ where: { endpoint: a.endpoint } });
        }
      }
    })
  );

  return sonuclar;
}
