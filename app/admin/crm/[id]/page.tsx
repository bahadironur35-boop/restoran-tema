import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import MusteriDetay from "@/components/admin/MusteriDetay";

export default async function MusteriDetayPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) redirect("/login");
  const { id } = await params;

  const musteri = await prisma.musteri.findUnique({
    where: { id: Number(id) },
    include: {
      ziyaretler: { orderBy: { createdAt: "desc" } },
      rezervasyonlar: { orderBy: { createdAt: "desc" } },
      puanHareketler: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!musteri) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <a href="/admin/crm" className="text-mu hover:text-th text-sm transition-colors">← CRM</a>
        <span className="text-mu">/</span>
        <h1 className="text-2xl font-bold">{musteri.name}</h1>
        {musteri.vip && <span className="text-go">⭐ VIP</span>}
      </div>
      <MusteriDetay musteri={musteri} />
    </div>
  );
}
