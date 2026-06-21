import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import MenuYonetim from "@/components/admin/MenuYonetim";
import Link from "next/link";
import { Palette } from "lucide-react";

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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Menü Yönetimi</h1>
        <Link href="/admin/menu/tasarim"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90"
          style={{ backgroundColor: "var(--gold)", color: "#fff" }}>
          <Palette size={15} />
          Menü Tasarla
        </Link>
      </div>
      <MenuYonetim items={items} initialKategoriler={kategoriler} />
    </div>
  );
}
