export type Plan = "lite" | "pro" | "premium";

// Hangi modüller hangi plana dahil
export const PLAN_MODULES: Record<Plan, Set<string>> = {
  lite: new Set([
    // Lite: sadece temel POS — modül toggle'ları yok
  ]),
  pro: new Set([
    "rezervasyonAktif",
    "kasaAktif",
    "kdsAktif",
    "galeriAktif",
    "crmAktif",
    "raporlarAktif",
    "mailBildirimiAktif",
    "rbacAktif",
  ]),
  premium: new Set([
    "rezervasyonAktif",
    "kasaAktif",
    "kdsAktif",
    "galeriAktif",
    "crmAktif",
    "raporlarAktif",
    "mailBildirimiAktif",
    "rbacAktif",
    "stokAktif",
    "teslimatAktif",
    "onlineOdemeAktif",
    "sadakatAktif",
    "sadakatDamgaAktif",
  ]),
};

export const PLAN_LABELS: Record<Plan, string> = {
  lite: "Lite",
  pro: "Pro",
  premium: "Premium",
};

export const PLAN_COLORS: Record<Plan, string> = {
  lite: "#64748B",
  pro: "#1A73E8",
  premium: "#8B5CF6",
};

export function getPlan(): Plan {
  const p = process.env.PLAN as Plan;
  return ["lite", "pro", "premium"].includes(p) ? p : "pro";
}

export function isModulAvailable(modul: string, plan: Plan): boolean {
  return PLAN_MODULES[plan].has(modul);
}
