import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const rows = await prisma.ayar.findMany();
  const moduller: Record<string, string> = {};
  for (const r of rows) moduller[r.key] = r.value;

  return <AdminShell moduller={moduller}>{children}</AdminShell>;
}
