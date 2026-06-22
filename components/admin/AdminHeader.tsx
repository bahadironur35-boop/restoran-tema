"use client";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Globe, LogOut, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import CalendarDropdown from "./CalendarDropdown";

const titles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/rezervasyonlar": "Rezervasyonlar",
  "/admin/masalar": "Masa & QR Yönetimi",
  "/admin/pos": "Satış Ekranı",
  "/admin/siparisler": "Siparişler",
  "/admin/menu": "Menü Yönetimi",
  "/admin/galeri": "Galeri",
  "/admin/crm": "Müşteri CRM",
  "/admin/stok": "Stok Takibi",
  "/admin/ayarlar": "Ayarlar",
};

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-center gap-1.5">
      <Clock size={14} style={{ color: "#94A3B8" }} />
      <span className="text-sm font-semibold tabular-nums" style={{ color: "#1A2332" }}>{time}</span>
    </div>
  );
}

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const title = titles[pathname] ?? "Yönetim Paneli";

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <header
      className="flex items-center justify-between px-6 flex-shrink-0"
      style={{
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        height: "64px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {/* Sol: Sayfa başlığı */}
      <div>
        <h1 className="text-base font-semibold" style={{ color: "#1A2332" }}>{title}</h1>
        <p className="text-xs" style={{ color: "#94A3B8" }}>EatOs Yönetim Paneli</p>
      </div>

      {/* Sağ */}
      <div className="flex items-center gap-3">

        {/* Saat */}
        <LiveClock />

        <div className="w-px h-5" style={{ backgroundColor: "#E2E8F0" }} />

        {/* Takvim / Tarih */}
        <CalendarDropdown />

        <div className="w-px h-5" style={{ backgroundColor: "#E2E8F0" }} />

        {/* Bildirim */}
        <button
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
          title="Bildirimler"
        >
          <Bell size={16} style={{ color: "#64748B" }} />
        </button>

        {/* Siteyi Gör */}
        <a
          href="/"
          target="_blank"
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
          title="Siteyi Gör"
        >
          <Globe size={16} style={{ color: "#64748B" }} />
        </a>

        {/* Çıkış */}
        <button
          onClick={handleLogout}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50"
          title="Çıkış Yap"
        >
          <LogOut size={16} style={{ color: "#EF4444" }} />
        </button>

        <div className="w-px h-5" style={{ backgroundColor: "#E2E8F0" }} />

        {/* Admin profil */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ backgroundColor: "#1A73E8" }}
            >
              A
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
              style={{ backgroundColor: "#22C55E" }}
            />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold leading-tight" style={{ color: "#1A2332" }}>Admin</p>
            <p className="text-xs" style={{ color: "#94A3B8" }}>Yönetici</p>
          </div>
        </div>
      </div>
    </header>
  );
}
