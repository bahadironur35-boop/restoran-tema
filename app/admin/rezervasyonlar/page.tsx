import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import RezervasyonTable from "@/components/admin/RezervasyonTable";

export default async function RezervasyonlarPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const rezervasyonlar = await prisma.rezervasyon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Rezervasyonlar</h1>
      <RezervasyonTable rezervasyonlar={rezervasyonlar} />
    </div>
  );
}
