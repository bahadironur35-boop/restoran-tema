import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import RezervasyonTable from "@/components/admin/RezervasyonTable";

export default async function RezervasyonlarPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const rezervasyonAyar = await prisma.ayar.findUnique({ where: { key: "rezervasyonAktif" } });
  if (rezervasyonAyar?.value === "false") {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-xl font-bold" style={{ color: "var(--text)" }}>Rezervasyon Modülü Devre Dışı</p>
        <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
          Ayarlar → Modüller → Rezervasyon Modülü
        </p>
      </div>
    );
  }

  const [rezervasyonlar, masalar] = await Promise.all([
    prisma.rezervasyon.findMany({
      orderBy: { createdAt: "desc" },
      include: { masa: { select: { no: true, alan: true } } },
    }),
    prisma.masa.findMany({
      where: { aktif: true },
      orderBy: [{ alan: "asc" }, { no: "asc" }],
      select: { id: true, no: true, alan: true, kapasite: true, durum: true },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--text)" }}>Rezervasyonlar</h1>
      <RezervasyonTable rezervasyonlar={rezervasyonlar} masalar={masalar} />
    </div>
  );
}
