import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import StokClient from "@/components/admin/StokClient";

export default async function StokPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Stok Takibi</h1>
      <p className="text-mu text-sm mb-8">Malzeme ve ürün stoklarını takip edin. Minimum stok altına düşünce uyarı alırsınız.</p>
      <StokClient />
    </div>
  );
}
