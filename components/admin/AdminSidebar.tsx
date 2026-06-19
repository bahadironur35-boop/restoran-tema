"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, Armchair, ShoppingCart,
  ClipboardList, UtensilsCrossed, Images, Users,
  Package, Settings, ChefHat, LayoutTemplate, BarChart2, Wallet, BookOpen, Layers,
} from "lucide-react";

const navItems = [
  { href: "/admin",               label: "Dashboard",        icon: LayoutDashboard },
  { href: "/admin/rezervasyonlar",label: "Rezervasyonlar",   icon: Calendar },
  { href: "/admin/masalar",       label: "Masa & QR",        icon: Armchair },
  { href: "/admin/plan",          label: "Masa Planı",       icon: LayoutTemplate },
  { href: "/admin/pos",           label: "Satış Ekranı",     icon: ShoppingCart },
  { href: "/admin/siparisler",    label: "Siparişler",       icon: ClipboardList },
  { href: "/admin/kasa",          label: "Kasa",             icon: Wallet },
  { href: "/admin/menu",          label: "Menü Yönetimi",    icon: UtensilsCrossed },
  { href: "/admin/galeri",        label: "Galeri",           icon: Images },
  { href: "/admin/icerik",        label: "İçerik Yönetimi",  icon: Layers },
  { href: "/admin/crm",           label: "Müşteri CRM",      icon: Users },
  { href: "/admin/stok",          label: "Stok Takibi",      icon: Package },
  { href: "/admin/raporlar",      label: "Raporlar",         icon: BarChart2 },
  { href: "/admin/ayarlar",       label: "Ayarlar",          icon: Settings },
  { href: "/admin/kurulum",       label: "Kurulum Rehberi",  icon: BookOpen },
];

const BG          = "#0A192F";
const BORDER      = "rgba(255,255,255,0.06)";
const ACTIVE      = "#1A73E8";
const ICON_BG     = "rgba(255,255,255,0.08)";
const TEXT        = "#94A3B8";
const TEXT_ACTIVE = "#FFFFFF";

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-full w-52 flex flex-col z-40"
      style={{ backgroundColor: BG, borderRight: `1px solid ${BORDER}` }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 flex-shrink-0" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: ICON_BG }}
        >
          <ChefHat size={15} color="white" strokeWidth={1.5} />
        </div>
        <div>
          <p className="font-bold text-white leading-tight" style={{ fontSize: "14px", letterSpacing: "0.01em" }}>EatOs</p>
          <p style={{ fontSize: "9px", color: TEXT, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500 }}>
            Restaurant POS
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 pt-3 space-y-0.5 overflow-y-auto pb-4">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all"
              style={{
                fontSize: "13px",
                ...(active
                  ? { backgroundColor: ACTIVE, color: TEXT_ACTIVE, fontWeight: 500 }
                  : { color: TEXT, fontWeight: 400 }),
              }}
            >
              <Icon
                size={15}
                strokeWidth={active ? 2 : 1.5}
                style={{ color: active ? "#fff" : TEXT, flexShrink: 0 }}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
