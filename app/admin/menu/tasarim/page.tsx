import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import MenuDesigner from "@/components/admin/MenuDesigner";

const DEFAULT_KATEGORILER = ["Başlangıçlar", "Ana Yemekler", "Tatlılar", "İçecekler"];

export default async function MenuTasarimPage() {
  if (!(await hasRole("admin", "mudur"))) redirect("/admin");

  const [items, ayar, restoranAyar] = await Promise.all([
    prisma.menuItem.findMany({ where: { active: true }, orderBy: [{ category: "asc" }, { order: "asc" }] }),
    prisma.ayar.findUnique({ where: { key: "menuKategoriler" } }),
    prisma.ayar.findMany({ where: { key: { in: ["restaurantName", "address", "phone"] } } }),
  ]);

  let kategoriler: string[] = DEFAULT_KATEGORILER;
  if (ayar) { try { kategoriler = JSON.parse(ayar.value); } catch { /* default */ } }

  const restoranBilgi = Object.fromEntries(restoranAyar.map((r) => [r.key, r.value]));

  return <MenuDesigner items={items} kategoriler={kategoriler} restoranBilgi={restoranBilgi} />;
}
