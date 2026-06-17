import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import GaleriYonetim from "@/components/admin/GaleriYonetim";

export default async function AdminGaleriPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const items = await prisma.galeriItem.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Galeri Yönetimi</h1>
      <GaleriYonetim items={items} />
    </div>
  );
}
