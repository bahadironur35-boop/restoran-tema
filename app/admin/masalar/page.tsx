import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import MasalarClient from "@/components/admin/MasalarClient";

export default async function AdminMasalarPage() {
  if (!(await isAuthenticated())) redirect("/login");
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Masa Yönetimi</h1>
      <p className="text-mu text-sm mb-8">QR kodları yazdırıp masalara koyun. Müşteri talepler burada canlı görünür.</p>
      <MasalarClient />
    </div>
  );
}
