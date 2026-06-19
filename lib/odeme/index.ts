export type { OdemeProvider, OdemeIstegi, OdemeSonucu, WebhookSonucu, OdemeAdapter } from "./types";
export { IyzicoAdapter } from "./iyzico";
export { StripeAdapter } from "./stripe";

import { IyzicoAdapter } from "./iyzico";
import { StripeAdapter } from "./stripe";
import type { OdemeAdapter, OdemeProvider } from "./types";

const ADAPTERS: Record<OdemeProvider, OdemeAdapter> = {
  iyzico: IyzicoAdapter,
  stripe: StripeAdapter,
};

export function getOdemeAdapter(provider: OdemeProvider): OdemeAdapter {
  return ADAPTERS[provider];
}

// Aktif provider'ı env'den al (varsayılan: iyzico)
export function getAktifProvider(): OdemeProvider {
  const p = process.env.ODEME_PROVIDER as OdemeProvider;
  return p === "stripe" ? "stripe" : "iyzico";
}
