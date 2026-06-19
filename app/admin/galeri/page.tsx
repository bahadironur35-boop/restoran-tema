import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import GaleriYonetim from "@/components/admin/GaleriYonetim";

export default async function AdminGaleriPage() {
  if (!(await hasRole("admin","mudur"))) redirect("/admin");

  const items = await prisma.galeriItem.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Galeri Yönetimi</h1>
      <GaleriYonetim items={items} />
    </div>
  );
}
