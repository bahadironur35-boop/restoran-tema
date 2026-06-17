import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import MenuYonetim from "@/components/admin/MenuYonetim";

export default async function AdminMenuPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const items = await prisma.menuItem.findMany({ orderBy: [{ category: "asc" }, { order: "asc" }] });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Menü Yönetimi</h1>
      <MenuYonetim items={items} />
    </div>
  );
}
