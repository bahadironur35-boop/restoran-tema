"use client";
import { useState } from "react";
import Link from "next/link";

const links = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/menu", label: "Menü" },
  { href: "/rezervasyon", label: "Rezervasyon" },
  { href: "/galeri", label: "Galeri" },
  { href: "/iletisim", label: "İletişim" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-sm border-b border-[#2A2A2A]">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-widest text-[#C9A84C] uppercase">
          La Maison
        </Link>

        {/* Desktop */}
        <ul className="hidden md:flex gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-sm tracking-wider text-gray-300 hover:text-[#C9A84C] transition-colors uppercase"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link href="/rezervasyon" className="hidden md:block btn-primary text-sm tracking-wider uppercase">
          Rezervasyon
        </Link>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
          aria-label="Menüyü aç/kapat"
        >
          <span className="block w-6 h-0.5 bg-white mb-1" />
          <span className="block w-6 h-0.5 bg-white mb-1" />
          <span className="block w-6 h-0.5 bg-white" />
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-black border-t border-[#2A2A2A] px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-gray-300 hover:text-[#C9A84C] uppercase text-sm tracking-wider"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
