"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/rezervasyonlar", label: "Rezervasyonlar", icon: "📅" },
  { href: "/admin/menu", label: "Menü Yönetimi", icon: "🍽️" },
  { href: "/admin/galeri", label: "Galeri", icon: "🖼️" },
  { href: "/admin/ayarlar", label: "Ayarlar", icon: "⚙️" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#111] border-r border-[#2A2A2A] flex flex-col">
      <div className="p-6 border-b border-[#2A2A2A]">
        <p className="text-[#C9A84C] font-bold tracking-widest uppercase text-sm">La Maison</p>
        <p className="text-gray-500 text-xs mt-0.5">Yönetim Paneli</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                active
                  ? "bg-[#C9A84C] text-black font-semibold"
                  : "text-gray-400 hover:text-white hover:bg-[#1A1A1A]"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#2A2A2A]">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          <span>🌐</span> Siteyi Gör
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:text-red-400 transition-colors w-full text-left mt-1"
        >
          <span>🚪</span> Çıkış
        </button>
      </div>
    </aside>
  );
}
