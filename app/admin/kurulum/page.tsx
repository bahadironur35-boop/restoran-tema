import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import KurulumRehberi from "@/components/admin/KurulumRehberi";

export default async function KurulumPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>Kurulum Rehberi</h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
        Yeni bir işletme için sistemi canlıya almadan önce yapılması gerekenler.
      </p>
      <KurulumRehberi />
    </div>
  );
}
