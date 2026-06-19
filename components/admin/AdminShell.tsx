"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, X, Bell, Globe, LogOut, Clock, ChefHat, UserCog } from "lucide-react";
import {
  LayoutDashboard, Calendar, Armchair, ShoppingCart,
  ClipboardList, UtensilsCrossed, Images, Users,
  Package, Settings, LayoutTemplate, BarChart2, Wallet, BookOpen, Layers,
} from "lucide-react";
import { useEffect } from "react";
import CalendarDropdown from "./CalendarDropdown";

type Role = "admin" | "mudur" | "garson" | "sef";

const navItems: { href: string; label: string; icon: React.ElementType; roles: Role[] }[] = [
  { href: "/admin",                label: "Dashboard",        icon: LayoutDashboard, roles: ["admin","mudur","garson","sef"] },
  { href: "/admin/rezervasyonlar", label: "Rezervasyonlar",   icon: Calendar,        roles: ["admin","mudur","garson"] },
  { href: "/admin/masalar",        label: "Masa & QR",        icon: Armchair,        roles: ["admin","mudur","garson"] },
  { href: "/admin/plan",           label: "Masa Planı",       icon: LayoutTemplate,  roles: ["admin","mudur","garson"] },
  { href: "/admin/pos",            label: "Satış Ekranı",     icon: ShoppingCart,    roles: ["admin","mudur","garson"] },
  { href: "/admin/siparisler",     label: "Siparişler",       icon: ClipboardList,   roles: ["admin","mudur","garson","sef"] },
  { href: "/admin/kasa",           label: "Kasa",             icon: Wallet,          roles: ["admin","mudur"] },
  { href: "/admin/menu",           label: "Menü Yönetimi",    icon: UtensilsCrossed, roles: ["admin","mudur"] },
  { href: "/admin/galeri",         label: "Galeri",           icon: Images,          roles: ["admin","mudur"] },
  { href: "/admin/icerik",         label: "İçerik Yönetimi",  icon: Layers,          roles: ["admin","mudur"] },
  { href: "/admin/crm",            label: "Müşteri CRM",      icon: Users,           roles: ["admin","mudur"] },
  { href: "/admin/stok",           label: "Stok Takibi",      icon: Package,         roles: ["admin","mudur"] },
  { href: "/admin/raporlar",       label: "Raporlar",         icon: BarChart2,       roles: ["admin","mudur"] },
  { href: "/admin/ayarlar",        label: "Ayarlar",          icon: Settings,        roles: ["admin"] },
  { href: "/admin/kullanicilar",   label: "Kullanıcılar",     icon: UserCog,         roles: ["admin"] },
  { href: "/admin/kurulum",        label: "Kurulum Rehberi",  icon: BookOpen,        roles: ["admin"] },
];

const titles: Record<string, string> = {
  "/admin":                  "Dashboard",
  "/admin/rezervasyonlar":   "Rezervasyonlar",
  "/admin/masalar":          "Masa & QR Yönetimi",
  "/admin/plan":             "Masa Planı",
  "/admin/pos":              "Satış Ekranı",
  "/admin/siparisler":       "Siparişler",
  "/admin/kasa":             "Kasa",
  "/admin/menu":             "Menü Yönetimi",
  "/admin/galeri":           "Galeri",
  "/admin/icerik":           "İçerik Yönetimi",
  "/admin/crm":              "Müşteri CRM",
  "/admin/stok":             "Stok Takibi",
  "/admin/raporlar":         "Raporlar",
  "/admin/ayarlar":          "Ayarlar",
  "/admin/kurulum":          "Kurulum Rehberi",
};

const BG     = "#0A192F";
const BORDER = "rgba(255,255,255,0.06)";
const ACTIVE = "#1A73E8";
const TEXT   = "#94A3B8";
const TEXT_A = "#FFFFFF";

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="hidden sm:flex items-center gap-1.5">
      <Clock size={14} style={{ color: "#94A3B8" }} />
      <span className="text-sm font-semibold tabular-nums" style={{ color: "#1A2332" }}>{time}</span>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    fetch("/api/admin/me").then((r) => r.ok ? r.json() : null).then(setMe);
  }, []);

  const title = titles[pathname] ?? "Yönetim Paneli";

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 flex-shrink-0" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
          <ChefHat size={15} color="white" strokeWidth={1.5} />
        </div>
        <div>
          <p className="font-bold text-white leading-tight" style={{ fontSize: "14px" }}>EatOs</p>
          <p style={{ fontSize: "9px", color: TEXT, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500 }}>
            Restaurant POS
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 pt-3 space-y-0.5 overflow-y-auto pb-4">
        {navItems
          .filter((item) => !me || item.roles.includes(me.role as Role))
          .map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all"
                style={{ fontSize: "13px", ...(active
                  ? { backgroundColor: ACTIVE, color: TEXT_A, fontWeight: 500 }
                  : { color: TEXT, fontWeight: 400 }) }}>
                <Icon size={15} strokeWidth={active ? 2 : 1.5}
                  style={{ color: active ? "#fff" : TEXT, flexShrink: 0 }} />
                {item.label}
              </Link>
            );
          })}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--bg)" }}>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-52 flex-col z-40"
        style={{ backgroundColor: BG, borderRight: `1px solid ${BORDER}` }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          {/* Drawer */}
          <aside className="relative flex flex-col w-56 h-full z-10"
            style={{ backgroundColor: BG }}>
            <SidebarContent />
          </aside>
          {/* Kapat butonu */}
          <button onClick={() => setOpen(false)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
            <X size={18} color="white" />
          </button>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 lg:ml-52 flex flex-col min-h-screen">

        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 flex-shrink-0"
          style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E2E8F0", height: "64px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>

          <div className="flex items-center gap-3">
            {/* Hamburger — sadece mobil */}
            <button onClick={() => setOpen(true)}
              className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100">
              <Menu size={20} style={{ color: "#64748B" }} />
            </button>

            <div>
              <h1 className="text-base font-semibold" style={{ color: "#1A2332" }}>{title}</h1>
              <p className="text-xs hidden sm:block" style={{ color: "#94A3B8" }}>EatOs Yönetim Paneli</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LiveClock />
            <div className="hidden sm:block w-px h-5" style={{ backgroundColor: "#E2E8F0" }} />
            <div className="hidden sm:block"><CalendarDropdown /></div>
            <div className="hidden sm:block w-px h-5" style={{ backgroundColor: "#E2E8F0" }} />
            <button className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors" title="Bildirimler">
              <Bell size={16} style={{ color: "#64748B" }} />
            </button>
            <a href="/" target="_blank"
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors" title="Siteyi Gör">
              <Globe size={16} style={{ color: "#64748B" }} />
            </a>
            <button onClick={handleLogout}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors" title="Çıkış Yap">
              <LogOut size={16} style={{ color: "#EF4444" }} />
            </button>
            <div className="hidden sm:block w-px h-5" style={{ backgroundColor: "#E2E8F0" }} />
            <div className="hidden sm:flex items-center gap-2">
              <div className="relative">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: "#1A73E8" }}>
                  {me?.name?.[0]?.toUpperCase() ?? "A"}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                  style={{ backgroundColor: "#22C55E" }} />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold leading-tight" style={{ color: "#1A2332" }}>{me?.name ?? "Admin"}</p>
                <p className="text-xs capitalize" style={{ color: "#94A3B8" }}>{me?.role ?? "admin"}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
