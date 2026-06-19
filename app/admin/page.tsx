import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Calendar, ShoppingCart, UtensilsCrossed, Users,
  Clock, CheckCircle, LayoutTemplate, TrendingUp,
} from "lucide-react";

function parsePrice(p: string): number {
  return parseFloat(p.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
}

export default async function AdminDashboard() {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const bugun = new Date().toISOString().split("T")[0]; // "2026-06-19"

  // Haftalık başlangıç (7 gün önce)
  const haftaBaslangic = new Date();
  haftaBaslangic.setDate(haftaBaslangic.getDate() - 6);
  haftaBaslangic.setHours(0, 0, 0, 0);

  const [
    bugunRezervasyonlar,
    bekleyenRezervasyonlar,
    acikSiparisler,
    masalar,
    toplamMusteri,
    toplamMenu,
    sonRezervasyonlar,
    haftaSiparisler,
    acikSiparisDetay,
    populerUrunler,
    kritikStoklar,
  ] = await Promise.all([
    prisma.rezervasyon.count({ where: { date: bugun } }),
    prisma.rezervasyon.count({ where: { status: "bekliyor" } }),
    prisma.siparis.count({ where: { durum: { in: ["bekliyor", "hazirlaniyor", "hazir"] } } }),
    prisma.masa.findMany({ select: { durum: true } }),
    prisma.musteri.count(),
    prisma.menuItem.count({ where: { active: true } }),
    prisma.rezervasyon.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.siparis.findMany({
      where: { durum: "teslim", createdAt: { gte: haftaBaslangic } },
      include: { items: true },
    }),
    prisma.siparis.findMany({
      where: { durum: { in: ["bekliyor", "hazirlaniyor", "hazir"] } },
      include: { items: true, masa: { select: { no: true, alan: true } } },
      orderBy: { createdAt: "asc" },
      take: 5,
    }),
    prisma.siparisItem.groupBy({
      by: ["name"],
      where: { siparis: { createdAt: { gte: haftaBaslangic } } },
      _sum: { adet: true },
      orderBy: { _sum: { adet: "desc" } },
      take: 5,
    }),
    prisma.$queryRaw<{ id: number; name: string; miktar: number; minMiktar: number; birim: string }[]>`
      SELECT id, name, miktar, "minMiktar", birim FROM "StokItem" WHERE miktar <= "minMiktar" ORDER BY miktar ASC LIMIT 5
    `.catch(() => []),
  ]);

  // Hesaplamalar
  const toplamMasa = masalar.length;
  const doluMasa = masalar.filter((m) => m.durum === "dolu").length;
  const rezerveliMasa = masalar.filter((m) => m.durum === "rezerveli").length;
  const dolulukOrani = toplamMasa > 0 ? Math.round(((doluMasa + rezerveliMasa) / toplamMasa) * 100) : 0;

  const haftaGelir = haftaSiparisler.reduce((sum, s) =>
    sum + s.items.reduce((acc, item) => acc + parsePrice(item.price) * item.adet, 0), 0
  );

  const stats = [
    { label: "Bugün Rezervasyon", value: bugunRezervasyonlar, icon: Calendar,       color: "#1A73E8", bg: "#1A73E815", href: "/admin/rezervasyonlar" },
    { label: "Bekleyen",          value: bekleyenRezervasyonlar, icon: Clock,        color: "#F59E0B", bg: "#F59E0B15", href: "/admin/rezervasyonlar" },
    { label: "Açık Sipariş",      value: acikSiparisler,         icon: ShoppingCart, color: "#EF4444", bg: "#EF444415", href: "/admin/siparisler" },
    { label: "Masa Doluluk",      value: `%${dolulukOrani}`,     icon: LayoutTemplate, color: "#8B5CF6", bg: "#8B5CF615", href: "/admin/plan" },
    { label: "Toplam Müşteri",    value: toplamMusteri,           icon: Users,        color: "#06B6D4", bg: "#06B6D415", href: "/admin/crm" },
    { label: "Aktif Menü",        value: toplamMenu,              icon: UtensilsCrossed, color: "#22C55E", bg: "#22C55E15", href: "/admin/menu" },
  ];

  const statusInfo: Record<string, { label: string; color: string; bg: string }> = {
    bekliyor:   { label: "Bekliyor",   color: "#F59E0B", bg: "#F59E0B15" },
    onaylandi:  { label: "Onaylandı",  color: "#22C55E", bg: "#22C55E15" },
    reddedildi: { label: "Reddedildi", color: "#EF4444", bg: "#EF444415" },
  };

  const siparisDurumInfo: Record<string, { label: string; color: string }> = {
    bekliyor:     { label: "Bekliyor",     color: "#F59E0B" },
    hazirlaniyor: { label: "Hazırlanıyor", color: "#3B82F6" },
    hazir:        { label: "Hazır",        color: "#22C55E" },
  };

  return (
    <div className="space-y-6">

      {/* Stat kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href}
              className="card p-5 transition-all hover:shadow-md group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                  <Icon size={18} style={{ color: s.color }} />
                </div>
                <TrendingUp size={13} style={{ color: "var(--text-muted)" }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold mb-0.5" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Orta satır */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Son rezervasyonlar */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ color: "var(--text)" }}>Son Rezervasyonlar</h2>
            <Link href="/admin/rezervasyonlar" className="text-xs font-medium" style={{ color: "#1A73E8" }}>Tümünü Gör →</Link>
          </div>
          {sonRezervasyonlar.length === 0 ? (
            <div className="text-center py-10" style={{ color: "var(--text-muted)" }}>
              <Calendar size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">Henüz rezervasyon yok</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sonRezervasyonlar.map((r) => {
                const s = statusInfo[r.status];
                return (
                  <div key={r.id} className="flex items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: "var(--bg)" }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: "#1A73E815", color: "#1A73E8" }}>
                      {r.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{r.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{r.date} {r.time} – {r.guests} kişi</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ backgroundColor: s.bg, color: s.color }}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Masa özeti + Haftalık gelir */}
        <div className="space-y-4">

          {/* Masa durumu */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold" style={{ color: "var(--text)" }}>Masa Durumu</h2>
              <Link href="/admin/plan" className="text-xs font-medium" style={{ color: "#1A73E8" }}>Plana Git →</Link>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: "Boş",      value: toplamMasa - doluMasa - rezerveliMasa, color: "#16A34A" },
                { label: "Dolu",     value: doluMasa,       color: "#EF4444" },
                { label: "Rezerveli",value: rezerveliMasa,  color: "#F59E0B" },
              ].map((item) => (
                <div key={item.label} className="text-center p-2 rounded-lg" style={{ backgroundColor: "var(--bg)" }}>
                  <p className="text-xl font-bold" style={{ color: item.color }}>{item.value}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{item.label}</p>
                </div>
              ))}
            </div>
            {/* Doluluk bar */}
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${dolulukOrani}%`, backgroundColor: dolulukOrani > 75 ? "#EF4444" : dolulukOrani > 40 ? "#F59E0B" : "#16A34A" }} />
            </div>
            <p className="text-xs mt-1.5 text-right" style={{ color: "var(--text-muted)" }}>%{dolulukOrani} dolu</p>
          </div>

          {/* Haftalık gelir */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold" style={{ color: "var(--text)" }}>Haftalık Gelir</h2>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#22C55E15", color: "#22C55E" }}>7 gün</span>
            </div>
            <p className="text-3xl font-bold mt-2" style={{ color: "#22C55E" }}>
              ₺{haftaGelir.toLocaleString("tr-TR", { minimumFractionDigits: 0 })}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {haftaSiparisler.length} teslim edilmiş sipariş
            </p>
          </div>
        </div>
      </div>

      {/* Alt satır */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Açık siparişler */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ color: "var(--text)" }}>Açık Siparişler</h2>
            <Link href="/admin/siparisler" className="text-xs font-medium" style={{ color: "#1A73E8" }}>Tümünü Gör →</Link>
          </div>
          {acikSiparisDetay.length === 0 ? (
            <div className="text-center py-8" style={{ color: "var(--text-muted)" }}>
              <CheckCircle size={28} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">Açık sipariş yok</p>
            </div>
          ) : (
            <div className="space-y-2">
              {acikSiparisDetay.map((s) => {
                const info = siparisDurumInfo[s.durum];
                const toplam = s.items.reduce((acc, item) => acc + parsePrice(item.price) * item.adet, 0);
                return (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "var(--bg)" }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: `${info.color}15`, color: info.color }}>
                      {s.masa ? s.masa.no : "📦"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                        {s.masa ? `${s.masa.alan} · Masa ${s.masa.no}` : "Paket"}
                      </p>
                      <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                        {s.items.map((i) => `${i.adet}× ${i.name}`).join(", ")}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold" style={{ color: info.color }}>{info.label}</p>
                      <p className="text-xs font-bold" style={{ color: "var(--text)" }}>₺{toplam.toFixed(0)}</p>
                    </div>
                  </div>
                );
              })}
              {acikSiparisler > 5 && (
                <p className="text-xs text-center pt-1" style={{ color: "var(--text-muted)" }}>
                  +{acikSiparisler - 5} sipariş daha
                </p>
              )}
            </div>
          )}
        </div>

        {/* Popüler ürünler */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ color: "var(--text)" }}>Bu Hafta En Çok Sipariş</h2>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#1A73E815", color: "#1A73E8" }}>7 gün</span>
          </div>
          {populerUrunler.length === 0 ? (
            <div className="text-center py-8" style={{ color: "var(--text-muted)" }}>
              <UtensilsCrossed size={28} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">Bu hafta sipariş yok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {populerUrunler.map((u, i) => {
                const maxAdet = populerUrunler[0]._sum.adet ?? 1;
                const adet = u._sum.adet ?? 0;
                const oran = Math.round((adet / maxAdet) * 100);
                const colors = ["#1A73E8", "#8B5CF6", "#F59E0B", "#22C55E", "#06B6D4"];
                const color = colors[i] ?? colors[0];
                return (
                  <div key={u.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{u.name}</span>
                      <span className="text-xs font-bold ml-2 flex-shrink-0" style={{ color }}>{adet} adet</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
                      <div className="h-full rounded-full" style={{ width: `${oran}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Kritik stok uyarısı */}
      {kritikStoklar.length > 0 && (
        <div className="card p-5" style={{ borderLeft: "3px solid #EF4444" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold" style={{ color: "var(--text)" }}>⚠ Kritik Stok Uyarısı</h2>
            <Link href="/admin/stok" className="text-xs font-medium" style={{ color: "#1A73E8" }}>Stok Takibi →</Link>
          </div>
          <div className="space-y-2">
            {kritikStoklar.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                <span className="text-sm" style={{ color: "var(--text)" }}>{s.name}</span>
                <span className="text-sm font-bold" style={{ color: "#EF4444" }}>
                  {s.miktar} {s.birim} <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>(min: {s.minMiktar})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
