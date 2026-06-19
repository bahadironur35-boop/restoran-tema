import webpush from "web-push";
import { prisma } from "@/lib/prisma";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT ?? "mailto:admin@eatos.app",
  process.env.VAPID_PUBLIC_KEY ?? "",
  process.env.VAPID_PRIVATE_KEY ?? "",
);

export async function pushGonder(tip: "garson" | "musteri", payload: object, masaId?: number) {
  const where = masaId
    ? { tip, masaId }
    : { tip };

  const abonelikler = await prisma.pushAbonelik.findMany({ where });

  const sonuclar = await Promise.allSettled(
    abonelikler.map(async (a) => {
      try {
        await webpush.sendNotification(
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
