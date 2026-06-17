import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const [toplamRezervasyonlar, bekleyenler, onaylananlar, reddedilenler, toplamMenu] =
    await Promise.all([
      prisma.rezervasyon.count(),
      prisma.rezervasyon.count({ where: { status: "bekliyor" } }),
      prisma.rezervasyon.count({ where: { status: "onaylandi" } }),
      prisma.rezervasyon.count({ where: { status: "reddedildi" } }),
      prisma.menuItem.count({ where: { active: true } }),
    ]);

  const sonRezervasyonlar = await prisma.rezervasyon.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const stats = [
    { label: "Toplam Rezervasyon", value: toplamRezervasyonlar, color: "text-white" },
    { label: "Bekleyen", value: bekleyenler, color: "text-yellow-400" },
    { label: "Onaylanan", value: onaylananlar, color: "text-green-400" },
    { label: "Reddedilen", value: reddedilenler, color: "text-red-400" },
    { label: "Aktif Menü Öğesi", value: toplamMenu, color: "text-[#C9A84C]" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#1A1A1A] border border-[#2A2A2A] p-6">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-gray-500 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6">
        <h2 className="text-lg font-semibold mb-4">Son Rezervasyonlar</h2>
        {sonRezervasyonlar.length === 0 ? (
          <p className="text-gray-500 text-sm">Henüz rezervasyon yok.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-[#2A2A2A]">
                <th className="text-left py-2 pr-4">Ad</th>
                <th className="text-left py-2 pr-4">Tarih / Saat</th>
                <th className="text-left py-2 pr-4">Kişi</th>
                <th className="text-left py-2">Durum</th>
              </tr>
            </thead>
            <tbody>
              {sonRezervasyonlar.map((r) => (
                <tr key={r.id} className="border-b border-[#2A2A2A] last:border-0">
                  <td className="py-3 pr-4 font-medium">{r.name}</td>
                  <td className="py-3 pr-4 text-gray-400">{r.date} {r.time}</td>
                  <td className="py-3 pr-4 text-gray-400">{r.guests} kişi</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 text-xs font-semibold ${
                      r.status === "bekliyor" ? "bg-yellow-900/40 text-yellow-400" :
                      r.status === "onaylandi" ? "bg-green-900/40 text-green-400" :
                      "bg-red-900/40 text-red-400"
                    }`}>
                      {r.status === "bekliyor" ? "Bekliyor" : r.status === "onaylandi" ? "Onaylandı" : "Reddedildi"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
