import Stripe from "stripe";
import type { OdemeAdapter, OdemeIstegi, OdemeSonucu, WebhookSonucu } from "./types";

function getClient() {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2026-05-27.dahlia" });
}

export const StripeAdapter: OdemeAdapter = {
  provider: "stripe",

  async odemeBaslat(istek: OdemeIstegi): Promise<OdemeSonucu> {
    const stripe = getClient();

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        currency: "try",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "try",
              unit_amount: Math.round(istek.tutar * 100), // kuruş
              product_data: { name: istek.aciklama },
            },
          },
        ],
        customer_email: istek.musteriEmail,
        client_reference_id: istek.referansId,
        success_url: `${istek.callbackUrl}?status=success&ref=${istek.referansId}`,
        cancel_url: `${istek.callbackUrl}?status=cancel&ref=${istek.referansId}`,
        metadata: { referansId: istek.referansId },
      });

      return { ok: true, odemeUrl: session.url ?? undefined, externalId: session.id };
    } catch (e) {
      return { ok: false, hata: e instanceof Error ? e.message : "Stripe hatası" };
    }
  },

  async webhookDogrula(payload: unknown, signature?: string): Promise<WebhookSonucu> {
    const stripe = getClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

    try {
      const event = stripe.webhooks.constructEvent(
        payload as string | Buffer,
        signature ?? "",
        webhookSecret
      );

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const referansId = session.metadata?.referansId ?? session.client_reference_id ?? "";
        return { referansId, durum: "tamamlandi", externalId: session.id };
      }

      if (event.type === "charge.refunded") {
        const charge = event.data.object as Stripe.Charge;
        return { referansId: charge.metadata?.referansId ?? "", durum: "iade", externalId: charge.id };
      }

      return { referansId: "", durum: "basarisiz", hata: `İşlenmeyen event: ${event.type}` };
    } catch (e) {
      return { referansId: "", durum: "basarisiz", hata: e instanceof Error ? e.message : "Webhook hatası" };
    }
  },
};
