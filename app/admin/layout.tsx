import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";
import { getPlan } from "@/lib/plan";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    const [rows, session] = await Promise.all([prisma.ayar.findMany(), getSession()]);
    const moduller: Record<string, string> = {};
    for (const r of rows) moduller[r.key] = r.value;
    const isSuperAdmin = session?.isSuperAdmin ?? false;
    const plan = isSuperAdmin ? "premium" : getPlan();
    return <AdminShell moduller={moduller} plan={plan} isSuperAdmin={isSuperAdmin}>{children}</AdminShell>;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : "";
    return (
      <html><body style={{ padding: 40, fontFamily: "monospace" }}>
        <h1 style={{ color: "red" }}>Admin Layout Hata</h1>
        <pre style={{ whiteSpace: "pre-wrap" }}>{msg}</pre>
        <pre style={{ whiteSpace: "pre-wrap", color: "#666" }}>{stack}</pre>
      </body></html>
    );
  }
}
