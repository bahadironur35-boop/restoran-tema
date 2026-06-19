import { hasRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import KullanicilarClient from "@/components/admin/KullanicilarClient";

export default async function KullanicilarPage() {
  if (!(await hasRole("admin"))) redirect("/admin");
  return (
    <div>
      <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--text)" }}>Kullanıcı Yönetimi</h1>
      <KullanicilarClient />
    </div>
  );
}
