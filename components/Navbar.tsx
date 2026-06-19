"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const links = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/menu", label: "Menü" },
  { href: "/rezervasyon", label: "Rezervasyon" },
  { href: "/galeri", label: "Galeri" },
  { href: "/iletisim", label: "İletişim" },
];

type Props = {
  restaurantName?: string;
  logoUrl?: string;
  logoPozisyon?: string;
  brandColor?: string;
};

export default function Navbar({ restaurantName = "EatOs", logoUrl, logoPozisyon = "orta", brandColor = "#C9A84C" }: Props) {
  const [open, setOpen] = useState(false);

  const Logo = () => logoUrl ? (
    <Image src={logoUrl} alt={restaurantName} width={120} height={40} className="h-9 w-auto object-contain" />
  ) : (
    <span className="text-xl font-bold tracking-widest uppercase" style={{ color: brandColor }}>{restaurantName}</span>
  );

  return (
    <header className="fixed top-0 w-full z-50 bg-[var(--bg)]/90 backdrop-blur-sm border-b border-[var(--border)]">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className={logoPozisyon === "orta" ? "absolute left-1/2 -translate-x-1/2" : ""}>
          <Logo />
        </Link>

        <ul className="hidden md:flex gap-8 ml-auto">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-sm tracking-wider text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors uppercase">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link href="/rezervasyon" className="hidden md:inline-block btn-gold text-sm tracking-wider uppercase ml-8">
          Rezervasyon
        </Link>

        <button className="md:hidden text-[var(--text)] ml-auto" onClick={() => setOpen(!open)} aria-label="Menüyü aç/kapat">
          <span className="block w-6 h-0.5 bg-current mb-1" />
          <span className="block w-6 h-0.5 bg-current mb-1" />
          <span className="block w-6 h-0.5 bg-current" />
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-[var(--bg-card)] border-t border-[var(--border)] px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-[var(--text-muted)] hover:text-[var(--gold)] uppercase text-sm tracking-wider" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
