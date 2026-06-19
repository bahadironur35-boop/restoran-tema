import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import IcerikClient from "@/components/admin/IcerikClient";

export default async function IcerikPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>İçerik Yönetimi</h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
        Public sayfaların görsellerini, yazılarını ve marka kimliğini buradan düzenleyin.
      </p>
      <IcerikClient />
    </div>
  );
}
