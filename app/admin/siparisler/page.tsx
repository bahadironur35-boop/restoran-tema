import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import SiparislerClient from "@/components/admin/SiparislerClient";

export default async function SiparislerPage() {
  if (!(await isAuthenticated())) redirect("/login");
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Siparişler</h1>
      <p className="text-mu text-sm mb-8">Mutfaktan "Hazır" gelen siparişleri teslim edin.</p>
      <SiparislerClient />
    </div>
  );
}
