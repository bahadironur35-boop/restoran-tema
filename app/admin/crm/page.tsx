import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import CrmClient from "@/components/admin/CrmClient";

export default async function CrmPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Müşteri CRM</h1>
      <p className="text-mu text-sm mb-8">Rezervasyon onaylandığında müşteriler otomatik oluşur. VIP işaretleyin, doğum günü takibi yapın.</p>
      <CrmClient />
    </div>
  );
}
