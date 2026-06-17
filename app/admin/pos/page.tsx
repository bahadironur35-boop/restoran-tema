import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import PosClient from "@/components/admin/PosClient";

export default async function PosPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">POS — Sipariş Al</h1>
      <p className="text-gray-500 text-sm mb-8">Masa seçin, menüden ekleyin, mutfağa gönderin.</p>
      <PosClient />
    </div>
  );
}
