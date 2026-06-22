import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";
import { getPlan } from "@/lib/plan";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [rows, session] = await Promise.all([prisma.ayar.findMany(), getSession()]);
  const moduller: Record<string, string> = {};
  for (const r of rows) moduller[r.key] = r.value;
  const isSuperAdmin = session?.isSuperAdmin ?? false;
  const plan = isSuperAdmin ? "premium" : getPlan();

  return <AdminShell moduller={moduller} plan={plan} isSuperAdmin={isSuperAdmin}>{children}</AdminShell>;
}
