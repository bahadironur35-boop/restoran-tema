import type { OdemeAdapter, OdemeIstegi, OdemeSonucu, WebhookSonucu } from "./types";

// iyzipay CommonJS modülü
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Iyzipay = require("iyzipay");

function getClient() {
  return new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY ?? "",
    secretKey: process.env.IYZICO_SECRET_KEY ?? "",
    uri: process.env.IYZICO_ENV === "prod"
      ? "https://api.iyzipay.com"
      : "https://sandbox-api.iyzipay.com",
  });
}

export const IyzicoAdapter: OdemeAdapter = {
  provider: "iyzico",

  async odemeBaslat(istek: OdemeIstegi): Promise<OdemeSonucu> {
    const iyzipay = getClient();

    const [ad, ...soyadParts] = istek.musteriAdi.trim().split(" ");
    const soyad = soyadParts.join(" ") || ad;

    const request = {
      locale: "tr",
      conversationId: istek.referansId,
      price: istek.tutar.toFixed(2),
      paidPrice: istek.tutar.toFixed(2),
      currency: "TRY",
      basketId: istek.referansId,
      paymentGroup: "PRODUCT",
      callbackUrl: istek.callbackUrl,
      enabledInstallments: [1, 2, 3],
      buyer: {
        id: istek.referansId,
        name: ad,
        surname: soyad,
        email: istek.musteriEmail,
        identityNumber: "11111111111",
        registrationAddress: "Türkiye",
        city: "Istanbul",
        country: "Turkey",
        ip: istek.ipAdresi ?? "85.34.78.112",
      },
      shippingAddress: {
        contactName: istek.musteriAdi,
        city: "Istanbul",
        country: "Turkey",
        address: "Türkiye",
      },
      billingAddress: {
        contactName: istek.musteriAdi,
        city: "Istanbul",
        country: "Turkey",
        address: "Türkiye",
      },
      basketItems: [
        {
          id: istek.referansId,
          name: istek.aciklama,
          category1: "Yiyecek & İçecek",
          itemType: "PHYSICAL",
          price: istek.tutar.toFixed(2),
        },
      ],
    };

    return new Promise((resolve) => {
      iyzipay.checkoutFormInitialize.create(request, (err: unknown, result: Record<string, string>) => {
        if (err || result?.status !== "success") {
          resolve({ ok: false, hata: result?.errorMessage ?? String(err) });
          return;
        }
        resolve({
          ok: true,
          checkoutFormHtml: result.checkoutFormContent,
          externalId: result.token,
        });
      });
    });
  },

  async webhookDogrula(payload: unknown): Promise<WebhookSonucu> {
    const iyzipay = getClient();
    const body = payload as Record<string, string>;
    const token = body?.token;

    if (!token) return { referansId: "", durum: "basarisiz", hata: "Token yok" };

    return new Promise((resolve) => {
      iyzipay.checkoutForm.retrieve({ locale: "tr", token }, (err: unknown, result: Record<string, string>) => {
        if (err || result?.status !== "success") {
          resolve({ referansId: result?.conversationId ?? "", durum: "basarisiz", hata: result?.errorMessage });
          return;
        }
        const durum = result.paymentStatus === "SUCCESS" ? "tamamlandi" : "basarisiz";
        resolve({ referansId: result.conversationId, durum, externalId: result.paymentId });
      });
    });
  },
};
