import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import MenuYonetim from "@/components/admin/MenuYonetim";

const DEFAULT_KATEGORILER = ["Başlangıçlar", "Ana Yemekler", "Tatlılar", "İçecekler"];

export default async function AdminMenuPage() {
  if (!(await hasRole("admin","mudur"))) redirect("/admin");

  const [items, ayar] = await Promise.all([
    prisma.menuItem.findMany({ orderBy: [{ category: "asc" }, { order: "asc" }] }),
    prisma.ayar.findUnique({ where: { key: "menuKategoriler" } }),
  ]);

  let kategoriler: string[] = DEFAULT_KATEGORILER;
  if (ayar) { try { kategoriler = JSON.parse(ayar.value); } catch { /* default */ } }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Menü Yönetimi</h1>
      <MenuYonetim items={items} initialKategoriler={kategoriler} />
    </div>
  );
}
