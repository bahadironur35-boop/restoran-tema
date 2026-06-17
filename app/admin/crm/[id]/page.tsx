import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import MusteriDetay from "@/components/admin/MusteriDetay";

export default async function MusteriDetayPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const { id } = await params;

  const musteri = await prisma.musteri.findUnique({
    where: { id: Number(id) },
    include: {
      ziyaretler: { orderBy: { createdAt: "desc" } },
      rezervasyonlar: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!musteri) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <a href="/admin/crm" className="text-gray-500 hover:text-white text-sm transition-colors">← CRM</a>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold">{musteri.name}</h1>
        {musteri.vip && <span className="text-[#C9A84C]">⭐ VIP</span>}
      </div>
      <MusteriDetay musteri={musteri} />
    </div>
  );
}
