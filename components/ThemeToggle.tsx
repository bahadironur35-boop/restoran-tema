"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-colors ${className}
        border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--gold)] hover:border-[var(--gold)]`}
      aria-label="Tema değiştir"
      title={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
    >
      {isDark ? "☀️" : "🌙"}
      <span className="hidden sm:inline">{isDark ? "Aydınlık" : "Karanlık"}</span>
    </button>
  );
}
