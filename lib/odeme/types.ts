export type OdemeProvider = "iyzico" | "stripe";

export interface OdemeIstegi {
  referansId: string;      // bizim tekil ref
  tutar: number;           // TL cinsinden
  musteriAdi: string;
  musteriEmail: string;
  musteriTelefon?: string;
  aciklama: string;        // ör. "Masa 3 - EatOs"
  callbackUrl: string;     // ödeme sonrası dönüş URL
  ipAdresi?: string;
}

export interface OdemeSonucu {
  ok: boolean;
  // Başarılıysa: kullanıcı bu URL'e yönlendirilir
  odemeUrl?: string;
  // veya iframe için HTML (iyzico checkout form)
  checkoutFormHtml?: string;
  // provider'dan gelen id
  externalId?: string;
  hata?: string;
}

export interface WebhookSonucu {
  referansId: string;
  durum: "tamamlandi" | "basarisiz" | "iade";
  externalId?: string;
  hata?: string;
}

export interface OdemeAdapter {
  provider: OdemeProvider;
  odemeBaslat(istek: OdemeIstegi): Promise<OdemeSonucu>;
  webhookDogrula(payload: unknown, signature?: string): Promise<WebhookSonucu>;
}
