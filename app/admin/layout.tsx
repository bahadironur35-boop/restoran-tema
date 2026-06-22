import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";
import { getPlan } from "@/lib/plan";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const rows = await prisma.ayar.findMany();
  const moduller: Record<string, string> = {};
  for (const r of rows) moduller[r.key] = r.value;
  const plan = getPlan();

  return <AdminShell moduller={moduller} plan={plan}>{children}</AdminShell>;
}
