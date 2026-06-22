export type Plan = "lite" | "pro" | "premium";

// Hangi modül alanları plan ile kısıtlanabilir (diğerleri her zaman açık)
export const PLAN_GATED_FIELDS = new Set([
  "rezervasyonAktif",
  "kdsAktif",
  "galeriAktif",
  "crmAktif",
  "mailBildirimiAktif",
  "rbacAktif",
  "stokAktif",
  "teslimatAktif",
  "onlineOdemeAktif",
  "sadakatAktif",
  "sadakatDamgaAktif",
]);

// Hangi plan hangi modülleri açabilir
export const PLAN_MODULES: Record<Plan, Set<string>> = {
  lite: new Set([
    // Kasa ve Raporlar her plana dahil (toggle var ama kilitli değil)
    // Opsiyonel modül yok — sadece temel POS
  ]),
  pro: new Set([
    "rezervasyonAktif",
    "kdsAktif",
    "galeriAktif",
    "crmAktif",
    "mailBildirimiAktif",
    "rbacAktif",
  ]),
  premium: new Set([
    "rezervasyonAktif",
    "kdsAktif",
    "galeriAktif",
    "crmAktif",
    "mailBildirimiAktif",
    "rbacAktif",
    "stokAktif",
    "teslimatAktif",
    "onlineOdemeAktif",
    "sadakatAktif",
    "sadakatDamgaAktif",
  ]),
};

// Plan karşılaştırma tablosu (pazarlama / ayarlar sayfası için)
export const PLAN_FEATURES: { label: string; lite: boolean; pro: boolean; premium: boolean }[] = [
  { label: "Masa & QR Sipariş",       lite: true,  pro: true,  premium: true  },
  { label: "POS & Sipariş Yönetimi",  lite: true,  pro: true,  premium: true  },
  { label: "Menü Yönetimi",           lite: true,  pro: true,  premium: true  },
  { label: "Kasa / Ödeme Al",         lite: true,  pro: true,  premium: true  },
  { label: "Temel Raporlar",          lite: true,  pro: true,  premium: true  },
  { label: "Rezervasyonlar",          lite: false, pro: true,  premium: true  },
  { label: "KDS (Mutfak Ekranı)",     lite: false, pro: true,  premium: true  },
  { label: "Müşteri CRM",             lite: false, pro: true,  premium: true  },
  { label: "Galeri",                  lite: false, pro: true,  premium: true  },
  { label: "Mail Bildirimleri",       lite: false, pro: true,  premium: true  },
  { label: "Kullanıcı Rolleri (RBAC)",lite: false, pro: true,  premium: true  },
  { label: "Stok Takibi",             lite: false, pro: false, premium: true  },
  { label: "Teslimat / Kurye",        lite: false, pro: false, premium: true  },
  { label: "Online Ödeme (QR)",       lite: false, pro: false, premium: true  },
  { label: "Sadakat & Damga Kartı",   lite: false, pro: false, premium: true  },
];

export const PLAN_LABELS: Record<Plan, string> = {
  lite: "Lite",
  pro: "Pro",
  premium: "Premium",
};

export const PLAN_COLORS: Record<Plan, string> = {
  lite:    "#64748B",
  pro:     "#1A73E8",
  premium: "#8B5CF6",
};

// Hangi plana geçmek gerekir etiketi
export const UPGRADE_LABEL: Record<Plan, Record<string, string>> = {
  lite:    { pro: "Pro", premium: "Premium" },
  pro:     { premium: "Premium" },
  premium: {},
};

export function getPlan(): Plan {
  const p = process.env.PLAN as Plan;
  return ["lite", "pro", "premium"].includes(p) ? p : "pro";
}

export function isModulAvailable(modul: string, plan: Plan): boolean {
  if (!PLAN_GATED_FIELDS.has(modul)) return true; // plan ile kısıtlanmayan alan
  return PLAN_MODULES[plan].has(modul);
}

// Hangi plana geçince bu modül açılır?
export function requiredPlan(modul: string): Plan | null {
  if (PLAN_MODULES.lite.has(modul)) return null;
  if (PLAN_MODULES.pro.has(modul)) return "pro";
  if (PLAN_MODULES.premium.has(modul)) return "premium";
  return null;
}
