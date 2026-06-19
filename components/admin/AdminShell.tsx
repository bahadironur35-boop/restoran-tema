"use client";
import { useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, X, Bell, Globe, LogOut, Clock, ChefHat, UserCog } from "lucide-react";
import {
  LayoutDashboard, Calendar, Armchair, ShoppingCart,
  ClipboardList, UtensilsCrossed, Images, Users,
  Package, Settings, LayoutTemplate, BarChart2, Wallet, BookOpen, Layers, Tag,
} from "lucide-react";
import { useEffect } from "react";
import CalendarDropdown from "./CalendarDropdown";

type Role = "admin" | "mudur" | "garson" | "sef";

// modul: hangi ayar key'i "true" olduğunda gösterilir. undefined = her zaman göster
const navItems: { href: string; label: string; icon: React.ElementType; roles: Role[]; modul?: string }[] = [
  { href: "/admin",                label: "Dashboard",        icon: LayoutDashboard, roles: ["admin","mudur","garson","sef"] },
  { href: "/admin/rezervasyonlar", label: "Rezervasyonlar",   icon: Calendar,        roles: ["admin","mudur","garson"],      modul: "rezervasyonAktif" },
  { href: "/admin/masalar",        label: "Masa & QR",        icon: Armchair,        roles: ["admin","mudur","garson"] },
  { href: "/admin/plan",           label: "Masa Planı",       icon: LayoutTemplate,  roles: ["admin","mudur","garson"] },
  { href: "/admin/pos",            label: "Satış Ekranı",     icon: ShoppingCart,    roles: ["admin","mudur","garson"] },
  { href: "/admin/siparisler",     label: "Siparişler",       icon: ClipboardList,   roles: ["admin","mudur","garson","sef"] },
  { href: "/admin/kasa",           label: "Kasa",             icon: Wallet,          roles: ["admin","mudur"],               modul: "kasaAktif" },
  { href: "/admin/menu",           label: "Menü Yönetimi",    icon: UtensilsCrossed, roles: ["admin","mudur"] },
  { href: "/admin/galeri",         label: "Galeri",           icon: Images,          roles: ["admin","mudur"],               modul: "galeriAktif" },
  { href: "/admin/icerik",         label: "İçerik Yönetimi",  icon: Layers,          roles: ["admin","mudur"] },
  { href: "/admin/crm",            label: "Müşteri CRM",      icon: Users,           roles: ["admin","mudur"],               modul: "crmAktif" },
  { href: "/admin/stok",           label: "Stok Takibi",      icon: Package,         roles: ["admin","mudur"],               modul: "stokAktif" },
  { href: "/admin/raporlar",       label: "Raporlar",         icon: BarChart2,       roles: ["admin","mudur"],               modul: "raporlarAktif" },
  { href: "/admin/kuponlar",        label: "Kuponlar",         icon: Tag,             roles: ["admin","mudur"] },
  { href: "/admin/ayarlar",        label: "Ayarlar",          icon: Settings,        roles: ["admin"] },
  { href: "/admin/kullanicilar",   label: "Kullanıcılar",     icon: UserCog,         roles: ["admin"],                       modul: "rbacAktif" },
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

type ShellToast = { id: number; masaNo: number; tip: string };

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<{ name: string; email: string; role: string } | null>(null);
  const [shellToastlar, setShellToastlar] = useState<ShellToast[]>([]);
  const [moduller, setModuller] = useState<Record<string, string>>({});
  const shellCounter = useRef(0);
  const bildirildi = useRef<Set<number>>(new Set());

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    fetch("/api/admin/me").then((r) => r.ok ? r.json() : null).then(setMe);
    fetch("/api/admin/ayarlar").then((r) => r.ok ? r.json() : {}).then(setModuller);
  }, []);

  // Global garson talebi dinleyici — her sayfada çalışır
  useEffect(() => {
    let es: EventSource;
    let retry: ReturnType<typeof setTimeout>;

    const connect = () => {
      es = new EventSource("/api/events?scope=masalar");
      es.addEventListener("update", (e) => {
        try {
          const { masalar } = JSON.parse(e.data) as { masalar: { no: number; talepler: { id: number; tip: string }[] }[] };
          if (!masalar) return;
          for (const m of masalar) {
            for (const t of (m.talepler ?? [])) {
              if (bildirildi.current.has(t.id)) continue;
              bildirildi.current.add(t.id);
              // Ses çal
              try {
                const ctx = new AudioContext();
                const beepAt = (freq: number, start: number, dur = 0.15) => {
                  const osc = ctx.createOscillator(); const g = ctx.createGain();
                  osc.connect(g); g.connect(ctx.destination);
                  osc.frequency.value = freq; osc.type = "sine";
                  g.gain.setValueAtTime(0.3, ctx.currentTime + start);
                  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
                  osc.start(ctx.currentTime + start); osc.stop(ctx.currentTime + start + dur + 0.05);
                };
                if (t.tip === "hesap") { beepAt(660, 0); beepAt(880, 0.2); }
                else { beepAt(880, 0); }
              } catch { /* AudioContext kullanıcı etkileşimi gerektirebilir */ }
              // Yalnızca Masa & QR sayfasında değilsek göster (orada zaten var)
              if (!pathname.startsWith("/admin/masalar")) {
                const id = ++shellCounter.current;
                setShellToastlar((p) => [...p, { id, masaNo: m.no, tip: t.tip }]);
                setTimeout(() => setShellToastlar((p) => p.filter((x) => x.id !== id)), 6000);
              }
            }
          }
        } catch { /* ignore */ }
      });
      es.onerror = () => { es.close(); retry = setTimeout(connect, 1000); };
    };

    connect();
    return () => { es?.close(); clearTimeout(retry); };
  }, [pathname]);

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
          .filter((item) => !item.modul || moduller[item.modul] !== "false")
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

      {/* Global garson talebi toast bildirimleri */}
      {shellToastlar.length > 0 && (
        <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
          {shellToastlar.map((t) => (
            <div key={t.id}
              className="pointer-events-auto px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce"
              style={{
                backgroundColor: t.tip === "hesap" ? "#92400E" : "#1E3A5F",
                border: `1px solid ${t.tip === "hesap" ? "#F59E0B" : "#3B82F6"}`,
                color: "#fff",
                minWidth: "220px",
              }}>
              <span style={{ fontSize: "22px" }}>{t.tip === "hesap" ? "💳" : "🔔"}</span>
              <div>
                <p className="font-bold text-sm">Masa {t.masaNo}</p>
                <p className="text-xs opacity-80">{t.tip === "hesap" ? "Hesap istiyor" : "Garson çağırıyor"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
