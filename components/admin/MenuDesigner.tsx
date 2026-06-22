"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Download, MessageCircle, Mail, ChevronDown, ChevronUp, GripVertical, X, Loader2 } from "lucide-react";

type MenuItem = {
  id: number; name: string; desc: string; price: string;
  category: string; image?: string | null; happyHourPrice?: string | null;
};

type Settings = {
  // Sayfa
  boyut: "A4" | "A5" | "A3" | "kare" | "ozel";
  ozelW: number;
  ozelH: number;
  yon: "dikey" | "yatay";
  marginMm: number;
  // Zemin
  bgColor: string;
  bgImage: string;
  bgOpacity: number;
  // Düzen
  kolonSayisi: 1 | 2 | 3;
  kategoriStil: "cizgi" | "kutu" | "sadece-yazi";
  fotografGoster: boolean;
  fotografBoyut: number;
  fotografRadius: number;
  aciklamaGoster: boolean;
  fiyatHizalama: "sag" | "inline";
  dolguGoster: boolean;
  dolguStil: "nokta" | "cizgi" | "orta-nokta" | "tire" | "kare";
  dolguRenk: string;
  // Boşluklar
  kategoriAraBoşluk: number;
  urunAraBoşluk: number;
  kategoriBaslikAlt: number;
  kolonAraBoşluk: number;
  kategoriHizalama: "left" | "center" | "right";
  // Başlık
  logoUrl: string;
  restoranAdi: string;
  altBaslik: string;
  adres: string;
  // Renkler
  kategoriRenk: string;
  urunRenk: string;
  fiyatRenk: string;
  aciklamaRenk: string;
  // Fontlar
  baslikFont: string;
  kategoriFont: string;
  urunFont: string;
  // Boyutlar
  kategoriFs: number;
  urunFs: number;
  fiyatFs: number;
  aciklamaFs: number;
  restoranAdiFs: number;
  // Çerçeve
  cerceveler: CerceveSetting[];
};

type KenarStil  = "tek-cizgi" | "cift-cizgi" | "uc-cizgi" | "noktali" | "tire" | "wavy" | "zigzag";
type KoseEfekt  = "yok" | "rounded" | "bevel" | "fancy" | "floral";
type KenarDesen = "yok" | "elmas" | "yildiz" | "cicek" | "yaprak" | "klasik";

type CerceveSetting = {
  id: number;
  kenarStil: KenarStil;
  kose: KoseEfekt;
  desen: KenarDesen;
  renk: string;
  opacity: number;
  kalinlik: number;
  icBoşluk: number; // mm
};

const GOOGLE_FONTS = [
  "Playfair Display", "Cormorant Garamond", "Lora", "Merriweather", "EB Garamond",
  "Crimson Text", "Libre Baskerville", "DM Serif Display", "Spectral",
  "Inter", "Poppins", "Montserrat", "Raleway", "Nunito", "Open Sans",
  "Roboto", "Lato", "Source Sans 3", "Work Sans", "DM Sans",
  "Dancing Script", "Pacifico", "Great Vibes", "Sacramento",
  "Oswald", "Bebas Neue",
];

const PAGE_SIZES: Record<string, { w: number; h: number }> = {
  A4:   { w: 210, h: 297 },
  A5:   { w: 148, h: 210 },
  A3:   { w: 297, h: 420 },
  kare: { w: 210, h: 210 },
  ozel: { w: 210, h: 297 }, // placeholder, gerçek değer s.ozelW/H'dan gelir
};

const DEFAULT: Settings = {
  boyut: "A4", yon: "dikey", marginMm: 12, ozelW: 210, ozelH: 297,
  bgColor: "#ffffff", bgImage: "", bgOpacity: 0.15,
  kolonSayisi: 2, kategoriStil: "cizgi",
  fotografGoster: false, fotografBoyut: 48, fotografRadius: 4, aciklamaGoster: true, fiyatHizalama: "sag",
  dolguGoster: true, dolguStil: "nokta", dolguRenk: "#999999",
  kategoriAraBoşluk: 20, urunAraBoşluk: 6, kategoriBaslikAlt: 6, kolonAraBoşluk: 12, kategoriHizalama: "left",
  logoUrl: "", restoranAdi: "", altBaslik: "", adres: "",
  kategoriRenk: "#1a1a1a", urunRenk: "#1a1a1a", fiyatRenk: "#c8860a", aciklamaRenk: "#666666",
  baslikFont: "Playfair Display", kategoriFont: "Playfair Display", urunFont: "Inter",
  kategoriFs: 14, urunFs: 11, fiyatFs: 11, aciklamaFs: 9, restoranAdiFs: 28,
  cerceveler: [],
};

// ── Ayar paneli bölümleri ──────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="relative inline-flex items-center shrink-0 transition-all duration-200"
      style={{ width: 36, height: 20, borderRadius: 10, backgroundColor: value ? "var(--gold)" : "var(--border)" }}
    >
      <span
        className="inline-block transition-all duration-200"
        style={{
          width: 14, height: 14, borderRadius: "50%", backgroundColor: "#fff",
          transform: value ? "translateX(18px)" : "translateX(3px)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
        }}
      />
    </button>
  );
}

function Section({ title, children, open, onToggle }: { title: string; children: React.ReactNode; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b" style={{ borderColor: "var(--border)" }}>
      <button className="flex items-center justify-between w-full px-4 py-3 text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--text-muted)" }} onClick={onToggle}>
        {title}
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-xs shrink-0" style={{ color: "var(--text-muted)", minWidth: 90 }}>{label}</label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

const inp = "w-full rounded-lg border px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-400";
const sel = "w-full rounded-lg border px-2 py-1.5 text-xs outline-none bg-white";

// ── Önizleme bileşeni (printable) ─────────────────────
function Preview({
  s, items, kategoriler, gizliKat, gizliUrun, printRef,
}: {
  s: Settings;
  items: MenuItem[];
  kategoriler: string[];
  gizliKat: Set<string>;
  gizliUrun: Set<number>;
  printRef: React.RefObject<HTMLDivElement>;
}) {
  const size = s.boyut === "ozel" ? { w: s.ozelW, h: s.ozelH } : PAGE_SIZES[s.boyut];
  const w = s.yon === "dikey" ? size.w : size.h;
  const h = s.yon === "dikey" ? size.h : size.w;
  const MM = 3.7795;

  const aktifKat = kategoriler.filter(c => !gizliKat.has(c));
  const grouped = aktifKat.reduce<Record<string, MenuItem[]>>((acc, cat) => {
    acc[cat] = items.filter(i => i.category === cat && !gizliUrun.has(i.id));
    return acc;
  }, {});

  return (
    <div ref={printRef}
      className="relative"
      style={{
        width: w * MM, minHeight: h * MM,
        backgroundColor: s.bgColor,
        fontFamily: s.urunFont + ", sans-serif",
        flexShrink: 0,
      }}>
      {/* Arka plan resmi */}
      {s.bgImage && (
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${s.bgImage})`,
          backgroundSize: "cover", backgroundPosition: "center",
          opacity: s.bgOpacity,
        }} />
      )}

      {/* Çerçeveler */}
      {s.cerceveler.map(c => {
        const inset = c.icBoşluk * MM;
        const px = c.kalinlik;
        const W = w * MM, H = h * MM;
        const x = inset, y = inset, rw = W - inset * 2, rh = H - inset * 2;
        const r = c.renk;
        const f = (n: number) => +n.toFixed(2);
        const rx = c.kose === "rounded" ? px * 10 : 0;
        const bv = px * 14; // bevel cut size

        // Kenar çizgisi path'i (wavy / zigzag için)
        const sidePath = (ax: number, ay: number, bx: number, by: number) => {
          const dx = bx - ax, dy = by - ay;
          const len = Math.sqrt(dx * dx + dy * dy);
          const ux = dx / len, uy = dy / len;
          const nx = -uy, ny = ux;
          const amp = px * 5;
          if (c.kenarStil === "wavy") {
            const steps = Math.max(3, Math.round(len / (amp * 6)));
            let d = `M ${f(ax)} ${f(ay)}`;
            for (let i = 0; i < steps; i++) {
              const ex = f(ax + ux * (i + 1) / steps * len), ey = f(ay + uy * (i + 1) / steps * len);
              const c1x = f(ax + ux * (i / steps + 0.25 / steps) * len + nx * amp);
              const c1y = f(ay + uy * (i / steps + 0.25 / steps) * len + ny * amp);
              const c2x = f(ax + ux * (i / steps + 0.75 / steps) * len - nx * amp);
              const c2y = f(ay + uy * (i / steps + 0.75 / steps) * len - ny * amp);
              d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${ex} ${ey}`;
            }
            return d;
          }
          if (c.kenarStil === "zigzag") {
            const steps = Math.max(3, Math.round(len / (amp * 3)));
            let d = `M ${f(ax)} ${f(ay)}`;
            for (let i = 0; i < steps; i++) {
              const t1 = (i + 0.5) / steps, t2 = (i + 1) / steps;
              const dir = i % 2 === 0 ? 1 : -1;
              d += ` L ${f(ax + ux * t1 * len + nx * amp * dir)} ${f(ay + uy * t1 * len + ny * amp * dir)} L ${f(ax + ux * t2 * len)} ${f(ay + uy * t2 * len)}`;
            }
            return d;
          }
          return "";
        };

        // Kenar deseni sembolleri
        const desenSymbols = (ax: number, ay: number, bx: number, by: number) => {
          if (c.desen === "yok") return null;
          const dx = bx - ax, dy = by - ay;
          const len = Math.sqrt(dx * dx + dy * dy);
          const sz = px * 4;
          const spacing = sz * 5;
          const count = Math.max(1, Math.floor(len / spacing));
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          return Array.from({ length: count + 1 }, (_, i) => {
            const t = i / count;
            const cx = f(ax + dx * t), cy = f(ay + dy * t);
            const tr = `translate(${cx} ${cy}) rotate(${f(angle)})`;
            if (c.desen === "elmas") return <polygon key={i} transform={tr} points={`0,${-sz} ${sz},0 0,${sz} ${-sz},0`} fill={r} />;
            if (c.desen === "yildiz") {
              const pts = Array.from({ length: 5 }, (_, k) => {
                const a1 = (k * 72 - 90) * Math.PI / 180, a2 = (k * 72 + 36 - 90) * Math.PI / 180;
                return `${f(Math.cos(a1) * sz)},${f(Math.sin(a1) * sz)} ${f(Math.cos(a2) * sz * 0.45)},${f(Math.sin(a2) * sz * 0.45)}`;
              }).join(" ");
              return <polygon key={i} transform={tr} points={pts} fill={r} />;
            }
            if (c.desen === "cicek") return (
              <g key={i} transform={tr}>
                {[0, 60, 120, 180, 240, 300].map(a => {
                  const rad = a * Math.PI / 180;
                  return <ellipse key={a} cx={f(Math.cos(rad) * sz * 0.6)} cy={f(Math.sin(rad) * sz * 0.6)} rx={f(sz * 0.55)} ry={f(sz * 0.3)} transform={`rotate(${a})`} fill={r} />;
                })}
                <circle cx="0" cy="0" r={f(sz * 0.3)} fill={r} />
              </g>
            );
            if (c.desen === "yaprak") return (
              <g key={i} transform={tr}>
                <path d={`M 0,${-sz} Q ${sz * 0.8},0 0,${sz} Q ${-sz * 0.8},0 0,${-sz}`} fill={r} />
                <line x1="0" y1={f(-sz)} x2="0" y2={f(sz)} stroke="white" strokeWidth={f(px * 0.5)} />
              </g>
            );
            if (c.desen === "klasik") return (
              <g key={i} transform={tr}>
                <path d={`M 0,${-sz} C ${sz},${-sz * 0.5} ${sz},${sz * 0.5} 0,${sz} C ${-sz},${sz * 0.5} ${-sz},${-sz * 0.5} 0,${-sz}`} fill={r} />
                <circle cx="0" cy="0" r={f(sz * 0.25)} fill="white" />
                <line x1={f(-sz)} y1="0" x2={f(sz)} y2="0" stroke="white" strokeWidth={f(px * 0.5)} />
              </g>
            );
            return null;
          });
        };

        // Köşe efektleri
        const koseEfekt = (cx: number, cy: number, idx: number) => {
          const sz = px * 16;
          const sx = idx === 1 || idx === 3 ? -1 : 1;
          const sy = idx === 2 || idx === 3 ? -1 : 1;
          const tr = `translate(${f(cx)} ${f(cy)})`;
          if (c.kose === "bevel") return (
            <line key={idx} x1={f(cx + sx * bv)} y1={f(cy)} x2={f(cx)} y2={f(cy + sy * bv)} stroke={r} strokeWidth={px * 2} strokeLinecap="round" />
          );
          if (c.kose === "fancy") return (
            <path key={idx} transform={tr}
              d={`M ${f(sx * sz)},0 Q ${f(sx * sz * 0.3)},${f(sy * sz * 0.3)} 0,${f(sy * sz)}
                  M ${f(sx * sz * 0.55)},0 Q ${f(sx * sz * 0.3)},${f(sy * sz * 0.3)} 0,${f(sy * sz * 0.55)}`}
              fill="none" stroke={r} strokeWidth={f(px * 1.5)} strokeLinecap="round" />
          );
          if (c.kose === "floral") {
            const pr = sz * 0.38;
            return (
              <g key={idx} transform={tr}>
                <circle cx={f(sx * sz * 0.45)} cy={f(sy * sz * 0.1)} r={f(pr)} fill="none" stroke={r} strokeWidth={px} />
                <circle cx={f(sx * sz * 0.1)} cy={f(sy * sz * 0.45)} r={f(pr)} fill="none" stroke={r} strokeWidth={px} />
                <circle cx={f(sx * sz * 0.42)} cy={f(sy * sz * 0.42)} r={f(pr * 0.5)} fill={r} />
              </g>
            );
          }
          return null;
        };

        // Bevel için özel border path
        const bevelPath = `M ${f(x + bv)},${f(y)} L ${f(x + rw - bv)},${f(y)} L ${f(x + rw)},${f(y + bv)} L ${f(x + rw)},${f(y + rh - bv)} L ${f(x + rw - bv)},${f(y + rh)} L ${f(x + bv)},${f(y + rh)} L ${f(x)},${f(y + rh - bv)} L ${f(x)},${f(y + bv)} Z`;

        const sides: [number, number, number, number][] = [
          [x, y, x + rw, y], [x + rw, y, x + rw, y + rh],
          [x + rw, y + rh, x, y + rh], [x, y + rh, x, y],
        ];
        const corners: [number, number][] = [[x, y], [x + rw, y], [x + rw, y + rh], [x, y + rh]];

        return (
          <svg key={c.id} style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible", opacity: c.opacity }} width={W} height={H}>
            {/* Kenar çizgisi */}
            {c.kenarStil === "tek-cizgi" && (c.kose === "bevel"
              ? <path d={bevelPath} fill="none" stroke={r} strokeWidth={px} />
              : <rect x={f(x)} y={f(y)} width={f(rw)} height={f(rh)} fill="none" stroke={r} strokeWidth={px} rx={rx} />
            )}
            {c.kenarStil === "cift-cizgi" && <>
              <rect x={f(x)} y={f(y)} width={f(rw)} height={f(rh)} fill="none" stroke={r} strokeWidth={px * 2.5} rx={rx} />
              <rect x={f(x + px * 5)} y={f(y + px * 5)} width={f(rw - px * 10)} height={f(rh - px * 10)} fill="none" stroke={r} strokeWidth={px * 0.8} rx={Math.max(0, rx - px * 5)} />
            </>}
            {c.kenarStil === "uc-cizgi" && <>
              <rect x={f(x)} y={f(y)} width={f(rw)} height={f(rh)} fill="none" stroke={r} strokeWidth={px * 3} rx={rx} />
              <rect x={f(x + px * 6)} y={f(y + px * 6)} width={f(rw - px * 12)} height={f(rh - px * 12)} fill="none" stroke={r} strokeWidth={px * 0.7} rx={Math.max(0, rx - px * 6)} />
              <rect x={f(x + px * 9)} y={f(y + px * 9)} width={f(rw - px * 18)} height={f(rh - px * 18)} fill="none" stroke={r} strokeWidth={px * 0.7} rx={Math.max(0, rx - px * 9)} />
            </>}
            {c.kenarStil === "noktali" && <rect x={f(x)} y={f(y)} width={f(rw)} height={f(rh)} fill="none" stroke={r} strokeWidth={px * 2} strokeDasharray={`${px * 2} ${px * 3}`} rx={rx} />}
            {c.kenarStil === "tire" && <rect x={f(x)} y={f(y)} width={f(rw)} height={f(rh)} fill="none" stroke={r} strokeWidth={px} strokeDasharray={`${px * 10} ${px * 5}`} rx={rx} />}
            {(c.kenarStil === "wavy" || c.kenarStil === "zigzag") && sides.map(([ax, ay, bx, by], i) => (
              <path key={i} d={sidePath(ax, ay, bx, by)} fill="none" stroke={r} strokeWidth={px} strokeLinecap="round" />
            ))}

            {/* Köşe efektleri */}
            {c.kose !== "yok" && c.kose !== "rounded" && corners.map(([cx, cy], i) => koseEfekt(cx, cy, i))}

            {/* Kenar deseni */}
            {c.desen !== "yok" && sides.map(([ax, ay, bx, by], i) => (
              <g key={i}>{desenSymbols(ax, ay, bx, by)}</g>
            ))}
          </svg>
        );
      })}

      {/* İçerik */}
      <div style={{ position: "relative", padding: s.marginMm * MM }}>

        {/* Başlık */}
        {(s.logoUrl || s.restoranAdi) && (
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            {s.logoUrl && (
              <img src={s.logoUrl} alt="logo"
                style={{ maxHeight: 60, maxWidth: 160, margin: "0 auto 8px", display: "block", objectFit: "contain" }} />
            )}
            {s.restoranAdi && (
              <div style={{ fontFamily: s.baslikFont + ", serif", fontSize: s.restoranAdiFs, fontWeight: 700, color: s.kategoriRenk, letterSpacing: "0.08em" }}>
                {s.restoranAdi}
              </div>
            )}
            {s.altBaslik && (
              <div style={{ fontFamily: s.urunFont + ", sans-serif", fontSize: 10, color: s.aciklamaRenk, marginTop: 2, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                {s.altBaslik}
              </div>
            )}
            {s.adres && (
              <div style={{ fontFamily: s.urunFont + ", sans-serif", fontSize: 8, color: s.aciklamaRenk, marginTop: 4 }}>
                {s.adres}
              </div>
            )}
            <div style={{ height: 1, backgroundColor: s.kategoriRenk, opacity: 0.2, margin: "10px 0" }} />
          </div>
        )}

        {/* Kategoriler — manuel grid, ürün sayısına göre dengeli dağıtım */}
        {(() => {
          const n = s.kolonSayisi;
          const visibleCats = aktifKat.filter(c => (grouped[c] ?? []).length > 0);

          // Kategori sayısı değil, ürün sayısı bazında dengeli dağıt
          const itemCounts = visibleCats.map(c => (grouped[c] ?? []).length);
          const total = itemCounts.reduce((a, b) => a + b, 0);
          const target = total / n;
          const cols: string[][] = Array.from({ length: n }, () => []);
          let col = 0, colSum = 0;
          visibleCats.forEach((cat, i) => {
            cols[col].push(cat);
            colSum += itemCounts[i];
            if (col < n - 1 && colSum >= target * (col + 1)) col++;
          });

          const renderCat = (cat: string) => {
            const catItems = grouped[cat] ?? [];
            return (
              <div key={cat} style={{ marginBottom: s.kategoriAraBoşluk }}>
                {/* Kategori başlığı */}
                {s.kategoriStil === "kutu" ? (
                  <div style={{
                    backgroundColor: s.kategoriRenk, color: "#fff",
                    fontFamily: s.kategoriFont + ", serif",
                    fontSize: s.kategoriFs, fontWeight: 700,
                    padding: "3px 8px", borderRadius: 4, marginBottom: s.kategoriBaslikAlt,
                    textTransform: "uppercase", letterSpacing: "0.08em",
                    textAlign: s.kategoriHizalama,
                  }}>{cat}</div>
                ) : (
                  <div style={{ marginBottom: s.kategoriBaslikAlt }}>
                    <div style={{
                      fontFamily: s.kategoriFont + ", serif",
                      fontSize: s.kategoriFs, fontWeight: 700,
                      color: s.kategoriRenk, textTransform: "uppercase",
                      letterSpacing: "0.08em", textAlign: s.kategoriHizalama,
                    }}>{cat}</div>
                    {s.kategoriStil === "cizgi" && (
                      <div style={{ height: 1, backgroundColor: s.kategoriRenk, opacity: 0.3, marginTop: 2 }} />
                    )}
                  </div>
                )}

                {/* Ürünler */}
                <div style={{ display: "flex", flexDirection: "column", gap: s.urunAraBoşluk }}>
                  {catItems.map(item => (
                    <div key={item.id} style={{ display: "flex", gap: 6, breakInside: "avoid" }}>
                      {s.fotografGoster && item.image && (
                        <img src={item.image} alt={item.name}
                          style={{ width: s.fotografBoyut, height: s.fotografBoyut, objectFit: "cover", borderRadius: s.fotografRadius, flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, width: "100%" }}>
                          <span style={{ fontFamily: s.urunFont + ", sans-serif", fontSize: s.urunFs, fontWeight: 600, color: s.urunRenk, flexShrink: 0, lineHeight: 1.3 }}>
                            {item.name}
                          </span>
                          {s.dolguGoster && s.fiyatHizalama === "sag" && (
                            <span style={{
                              flex: 1,
                              minWidth: 8,
                              display: "block",
                              marginBottom: "0.25em",
                              ...(s.dolguStil === "cizgi"
                                ? { borderBottom: `0.5px solid ${s.dolguRenk}` }
                                : s.dolguStil === "tire"
                                ? { borderBottom: `1.5px dashed ${s.dolguRenk}` }
                                : s.dolguStil === "orta-nokta"
                                ? { borderBottom: `1.5px dotted ${s.dolguRenk}` }
                                : s.dolguStil === "kare"
                                ? { backgroundImage: `repeating-linear-gradient(to right, ${s.dolguRenk} 0, ${s.dolguRenk} 2px, transparent 2px, transparent 6px)`, height: "2px", marginBottom: "0.3em" }
                                : { borderBottom: `1.5px dotted ${s.dolguRenk}` }
                              ),
                            }} />
                          )}
                          <span style={{ fontFamily: s.urunFont + ", sans-serif", fontSize: s.fiyatFs, fontWeight: 700, color: s.fiyatRenk, whiteSpace: "nowrap", flexShrink: 0, lineHeight: 1.3 }}>
                            {s.fiyatHizalama === "inline" && " — "}{item.price}
                          </span>
                        </div>
                        {s.aciklamaGoster && item.desc && (
                          <div style={{ fontFamily: s.urunFont + ", sans-serif", fontSize: s.aciklamaFs, color: s.aciklamaRenk, marginTop: 1, lineHeight: 1.3 }}>
                            {item.desc}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          };

          return (
            <div style={{ display: "flex", gap: s.kolonAraBoşluk * MM, alignItems: "flex-start" }}>
              {cols.map((colCats, ci) => (
                <div key={ci} style={{ flex: 1, minWidth: 0 }}>
                  {colCats.map(cat => renderCat(cat))}
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ── Ana bileşen ────────────────────────────────────────
export default function MenuDesigner({
  items, kategoriler, restoranBilgi,
}: {
  items: MenuItem[];
  kategoriler: string[];
  restoranBilgi: Record<string, string>;
}) {
  const [s, setS] = useState<Settings>({
    ...DEFAULT,
    restoranAdi: restoranBilgi.restaurantName ?? "",
    adres: restoranBilgi.address ?? "",
  });
  const printRef = useRef<HTMLDivElement>(null!);

  const SECTIONS = ["Sayfa","İçerik","Zemin","Restoran Başlığı","Düzen","Boşluklar","Fontlar","Yazı Boyutları","Çerçeve","Renkler"] as const;
  type SectionKey = typeof SECTIONS[number];
  const [acikSection, setAcikSection] = useState<SectionKey>("Sayfa");
  const sec = (title: SectionKey) => ({ open: acikSection === title, onToggle: () => setAcikSection(p => p === title ? ("" as SectionKey) : title) });

  // İçerik seçimi
  const [katSira, setKatSira]           = useState<string[]>(kategoriler);
  const [gizliKat, setGizliKat]         = useState<Set<string>>(new Set());
  const [gizliUrun, setGizliUrun]       = useState<Set<number>>(new Set());
  const [acikKat, setAcikKat]           = useState<Set<string>>(new Set());

  const toggleKat = (cat: string) =>
    setGizliKat(p => { const n = new Set(p); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });
  const toggleUrun = (id: number) =>
    setGizliUrun(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAcikKat = (cat: string) =>
    setAcikKat(p => { const n = new Set(p); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });
  const moveKat = (idx: number, dir: -1 | 1) => {
    const arr = [...katSira];
    const next = idx + dir;
    if (next < 0 || next >= arr.length) return;
    [arr[idx], arr[next]] = [arr[next], arr[idx]];
    setKatSira(arr);
  };
  const tumKatSec = (cat: string, sec: boolean) => {
    const catIds = items.filter(i => i.category === cat).map(i => i.id);
    setGizliUrun(p => {
      const n = new Set(p);
      catIds.forEach(id => sec ? n.delete(id) : n.add(id));
      return n;
    });
  };

  // Google Fonts yükle
  useEffect(() => {
    const fonts = [...new Set([s.baslikFont, s.kategoriFont, s.urunFont])];
    const url = "https://fonts.googleapis.com/css2?family=" +
      fonts.map(f => f.replace(/ /g, "+") + ":wght@400;600;700").join("&family=") + "&display=swap";
    const existing = document.getElementById("gf-designer");
    if (existing) existing.remove();
    const link = document.createElement("link");
    link.id = "gf-designer"; link.rel = "stylesheet"; link.href = url;
    document.head.appendChild(link);
  }, [s.baslikFont, s.kategoriFont, s.urunFont]);

  function set<K extends keyof Settings>(key: K, val: Settings[K]) {
    setS(p => ({ ...p, [key]: val }));
  }

  const [mailModal, setMailModal] = useState(false);
  const [mailAddr, setMailAddr] = useState("");
  const [mailLoading, setMailLoading] = useState(false);
  const [mailMsg, setMailMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<"pdf" | "whatsapp" | "mail" | null>(null);

  const getCanvas = async () => {
    const { default: html2canvas } = await import("html2canvas");
    return html2canvas(printRef.current, { useCORS: true, scale: 2, backgroundColor: null });
  };

  const handlePdfIndir = async () => {
    setActionLoading("pdf");
    try {
      const canvas = await getCanvas();
      const { default: jsPDF } = await import("jspdf");
      const size = s.boyut === "ozel" ? { w: s.ozelW, h: s.ozelH } : PAGE_SIZES[s.boyut];
      const w = s.yon === "dikey" ? size.w : size.h;
      const h = s.yon === "dikey" ? size.h : size.w;
      const pdf = new jsPDF({ orientation: s.yon === "yatay" ? "landscape" : "portrait", unit: "mm", format: [w, h] });
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, w, h);
      pdf.save(`${s.restoranAdi || "menu"}.pdf`);
    } finally { setActionLoading(null); }
  };

  const handleWhatsapp = async () => {
    setActionLoading("whatsapp");
    try {
      const canvas = await getCanvas();
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "menu.png", { type: "image/png" });
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: s.restoranAdi || "Menü" });
        } else {
          // Masaüstü: görseli indir + WhatsApp Web aç
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url; a.download = "menu.png"; a.click();
          URL.revokeObjectURL(url);
          setTimeout(() => window.open("https://web.whatsapp.com/", "_blank"), 500);
        }
        setActionLoading(null);
      });
    } catch { setActionLoading(null); }
  };

  const handleMailGonder = async () => {
    if (!mailAddr) return;
    setMailLoading(true); setMailMsg(null);
    try {
      const canvas = await getCanvas();
      const imageBase64 = canvas.toDataURL("image/png");
      const res = await fetch("/api/admin/menu/mail-gonder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: mailAddr, imageBase64, restoranAdi: s.restoranAdi }),
      });
      const data = await res.json();
      setMailMsg(res.ok ? { ok: true, text: "Mail gönderildi!" } : { ok: false, text: data.error || "Hata oluştu" });
    } catch { setMailMsg({ ok: false, text: "Bağlantı hatası" }); }
    finally { setMailLoading(false); }
  };

  const handlePrint = () => {
    const size = s.boyut === "ozel" ? { w: s.ozelW, h: s.ozelH } : PAGE_SIZES[s.boyut];
    const w = s.yon === "dikey" ? size.w : size.h;
    const h = s.yon === "dikey" ? size.h : size.w;
    const html = printRef.current?.outerHTML ?? "";
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${
        [...new Set([s.baslikFont, s.kategoriFont, s.urunFont])].map(f => f.replace(/ /g, "+") + ":wght@400;600;700").join("&family=")
      }&display=swap">
      <style>
        @page { size: ${w}mm ${h}mm; margin: 0; }
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }
      </style>
    </head><body>${html}<script>window.onload=()=>{window.print();window.close();}<\/script></body></html>`);
    win.document.close();
  };

  const size = s.boyut === "ozel" ? { w: s.ozelW, h: s.ozelH } : PAGE_SIZES[s.boyut];
  const w = s.yon === "dikey" ? size.w : size.h;
  const h = s.yon === "dikey" ? size.h : size.w;
  const MM = 3.7795;
  // Panel 380px + padding 24px → kalan alan
  const availW = typeof window !== "undefined" ? window.innerWidth - 380 - 24 : 900;
  const availH = typeof window !== "undefined" ? window.innerHeight - 24 : 820;
  const SCALE = Math.min(availW / (w * MM), availH / (h * MM), 1);

  return (
    <>
    {/* Mail Modal */}
    {mailModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
        <div className="rounded-2xl p-6 w-full max-w-sm shadow-2xl" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm" style={{ color: "var(--text)" }}>Menüyü Mail ile Gönder</h3>
            <button onClick={() => setMailModal(false)} className="p-1 rounded hover:bg-white/5">
              <X size={16} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            Menü görseli PNG olarak eklenti şeklinde gönderilecek.
          </p>
          <input
            type="email" placeholder="ornek@mail.com" value={mailAddr}
            onChange={e => setMailAddr(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleMailGonder()}
            className="w-full px-3 py-2 rounded-lg text-sm mb-3 outline-none"
            style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
          {mailMsg && (
            <p className="text-xs mb-3" style={{ color: mailMsg.ok ? "#22C55E" : "#EF4444" }}>{mailMsg.text}</p>
          )}
          <button onClick={handleMailGonder} disabled={mailLoading || !mailAddr}
            className="w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#3B82F6", color: "#fff" }}>
            {mailLoading ? <><Loader2 size={14} className="animate-spin" /> Gönderiliyor...</> : <><Mail size={14} /> Gönder</>}
          </button>
        </div>
      </div>
    )}
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>

      {/* Sol panel */}
      <div className="shrink-0 overflow-y-auto flex flex-col" style={{ width: 380, backgroundColor: "var(--bg-card)", borderRight: "1px solid var(--border)" }}>
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2.5 shrink-0 sticky top-0 z-10" style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
          <Link href="/admin/menu" className="p-1 rounded hover:bg-white/5 shrink-0">
            <ArrowLeft size={15} style={{ color: "var(--text-muted)" }} />
          </Link>

          <div className="ml-auto flex items-center gap-1">
            <button onClick={handlePrint} title="Yazdır"
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition-all hover:opacity-80"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
              <Printer size={12} /> Yazdır
            </button>
            <button onClick={handlePdfIndir} disabled={actionLoading === "pdf"} title="PDF olarak indir"
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: "#DC2626", color: "#fff" }}>
              {actionLoading === "pdf" ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />} PDF
            </button>
            <button onClick={handleWhatsapp} disabled={actionLoading === "whatsapp"} title="WhatsApp ile gönder"
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: "#25D366", color: "#fff" }}>
              {actionLoading === "whatsapp" ? <Loader2 size={12} className="animate-spin" /> : <MessageCircle size={12} />} WA
            </button>
            <button onClick={() => { setMailModal(true); setMailMsg(null); }} title="Mail ile gönder"
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: "#3B82F6", color: "#fff" }}>
              <Mail size={12} /> Mail
            </button>
          </div>
        </div>

        {/* Sayfa */}
        <Section title="Sayfa" {...sec("Sayfa")}>
          <Row label="Boyut">
            <select value={s.boyut} onChange={e => set("boyut", e.target.value as Settings["boyut"])} className={sel}>
              <option value="A4">A4 (210×297mm)</option>
              <option value="A5">A5 (148×210mm)</option>
              <option value="A3">A3 (297×420mm)</option>
              <option value="kare">Kare (210×210mm)</option>
              <option value="ozel">Özel ölçü...</option>
            </select>
          </Row>
          {s.boyut === "ozel" && (
            <Row label="Genişlik × Yükseklik">
              <div className="flex items-center gap-1">
                <input type="number" min={50} max={1000} value={s.ozelW}
                  onChange={e => set("ozelW", +e.target.value)}
                  className={inp} style={{ width: 70 }} />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>×</span>
                <input type="number" min={50} max={1000} value={s.ozelH}
                  onChange={e => set("ozelH", +e.target.value)}
                  className={inp} style={{ width: 70 }} />
                <span className="text-xs shrink-0" style={{ color: "var(--text-muted)" }}>mm</span>
              </div>
            </Row>
          )}
          <Row label="Yön">
            <div className="flex gap-2">
              {(["dikey","yatay"] as const).map(v => (
                <button key={v} onClick={() => set("yon", v)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all"
                  style={{ borderColor: s.yon === v ? "var(--gold)" : "var(--border)", backgroundColor: s.yon === v ? "var(--gold)" : "transparent", color: s.yon === v ? "#fff" : "var(--text)" }}>
                  {v === "dikey" ? "Dikey" : "Yatay"}
                </button>
              ))}
            </div>
          </Row>
          <Row label="Kenar boşl.">
            <div className="flex items-center gap-2">
              <input type="range" min={5} max={25} value={s.marginMm} onChange={e => set("marginMm", +e.target.value)} className="flex-1" />
              <span className="text-xs w-10 text-right" style={{ color: "var(--text-muted)" }}>{s.marginMm}mm</span>
            </div>
          </Row>
        </Section>

        {/* Zemin */}
        {/* İçerik */}
        <Section title="İçerik" {...sec("İçerik")}>
          <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
            Kategorileri ve ürünleri seç/çıkar, sırasını değiştir.
          </p>
          <div className="space-y-1.5">
            {katSira.map((cat, idx) => {
              const catItems = items.filter(i => i.category === cat);
              const katGizli = gizliKat.has(cat);
              const seciliSayisi = catItems.filter(i => !gizliUrun.has(i.id)).length;
              const katAcik = acikKat.has(cat);
              return (
                <div key={cat} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                  {/* Kategori satırı */}
                  <div className="flex items-center gap-1.5 px-2 py-2"
                    style={{ backgroundColor: katGizli ? "transparent" : "var(--bg)" }}>
                    {/* Sıra okları */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button onClick={() => moveKat(idx, -1)} disabled={idx === 0}
                        className="disabled:opacity-20 hover:opacity-60 leading-none">
                        <ChevronUp size={11} style={{ color: "var(--text-muted)" }} />
                      </button>
                      <button onClick={() => moveKat(idx, 1)} disabled={idx === katSira.length - 1}
                        className="disabled:opacity-20 hover:opacity-60 leading-none">
                        <ChevronDown size={11} style={{ color: "var(--text-muted)" }} />
                      </button>
                    </div>
                    {/* Toggle kategori */}
                    <button onClick={() => toggleKat(cat)}
                      className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all"
                      style={{ borderColor: katGizli ? "var(--border)" : "var(--gold)", backgroundColor: katGizli ? "transparent" : "var(--gold)" }}>
                      {!katGizli && <span style={{ color: "#fff", fontSize: 9, lineHeight: 1 }}>✓</span>}
                    </button>
                    {/* Kategori adı */}
                    <span className="flex-1 text-xs font-semibold truncate"
                      style={{ color: katGizli ? "var(--text-muted)" : "var(--text)", textDecoration: katGizli ? "line-through" : "none" }}>
                      {cat}
                    </span>
                    {/* Sayaç */}
                    {!katGizli && (
                      <span className="text-xs shrink-0" style={{ color: "var(--text-muted)" }}>
                        {seciliSayisi}/{catItems.length}
                      </span>
                    )}
                    {/* Aç/kapat ürünler */}
                    {!katGizli && (
                      <button onClick={() => toggleAcikKat(cat)} className="shrink-0 hover:opacity-60">
                        {katAcik ? <ChevronUp size={13} style={{ color: "var(--text-muted)" }} /> : <ChevronDown size={13} style={{ color: "var(--text-muted)" }} />}
                      </button>
                    )}
                  </div>

                  {/* Ürün listesi */}
                  {!katGizli && katAcik && (
                    <div className="border-t" style={{ borderColor: "var(--border)" }}>
                      {/* Tümünü seç/kaldır */}
                      <div className="flex gap-2 px-3 py-1.5 border-b" style={{ borderColor: "var(--border)" }}>
                        <button onClick={() => tumKatSec(cat, true)}
                          className="text-xs hover:underline" style={{ color: "var(--gold)" }}>Tümünü seç</button>
                        <span style={{ color: "var(--border)" }}>|</span>
                        <button onClick={() => tumKatSec(cat, false)}
                          className="text-xs hover:underline" style={{ color: "var(--text-muted)" }}>Tümünü kaldır</button>
                      </div>
                      <div className="py-1 max-h-48 overflow-y-auto">
                        {catItems.map(item => {
                          const gizli = gizliUrun.has(item.id);
                          return (
                            <button key={item.id} onClick={() => toggleUrun(item.id)}
                              className="flex items-center gap-2 w-full px-3 py-1.5 text-left hover:bg-black/5 transition-colors">
                              <div className="w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-all"
                                style={{ borderColor: gizli ? "var(--border)" : "var(--gold)", backgroundColor: gizli ? "transparent" : "var(--gold)" }}>
                                {!gizli && <span style={{ color: "#fff", fontSize: 8, lineHeight: 1 }}>✓</span>}
                              </div>
                              <span className="text-xs truncate"
                                style={{ color: gizli ? "var(--text-muted)" : "var(--text)", textDecoration: gizli ? "line-through" : "none" }}>
                                {item.name}
                              </span>
                              <span className="text-xs ml-auto shrink-0" style={{ color: "var(--text-muted)" }}>{item.price}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Zemin" {...sec("Zemin")}>
          <Row label="Renk">
            <div className="flex gap-2 items-center">
              <input type="color" value={s.bgColor} onChange={e => set("bgColor", e.target.value)}
                className="w-8 h-8 rounded border cursor-pointer" style={{ padding: 2 }} />
              <input type="text" value={s.bgColor} onChange={e => set("bgColor", e.target.value)} className={inp} />
            </div>
          </Row>
          <Row label="Arkaplan">
            <input type="text" placeholder="https://... (resim URL)" value={s.bgImage}
              onChange={e => set("bgImage", e.target.value)} className={inp} />
          </Row>
          {s.bgImage && (
            <Row label="Opaklık">
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={1} step={0.05} value={s.bgOpacity} onChange={e => set("bgOpacity", +e.target.value)} className="flex-1" />
                <span className="text-xs w-10 text-right" style={{ color: "var(--text-muted)" }}>{Math.round(s.bgOpacity * 100)}%</span>
              </div>
            </Row>
          )}
        </Section>

        {/* Başlık */}
        <Section title="Restoran Başlığı" {...sec("Restoran Başlığı")}>
          <Row label="Logo URL">
            <input type="text" placeholder="https://... (logo resmi)" value={s.logoUrl}
              onChange={e => set("logoUrl", e.target.value)} className={inp} />
          </Row>
          <Row label="Restoran Adı">
            <input type="text" value={s.restoranAdi} onChange={e => set("restoranAdi", e.target.value)} className={inp} />
          </Row>
          <Row label="Alt Başlık">
            <input type="text" placeholder="Fine Dining · Since 2010" value={s.altBaslik}
              onChange={e => set("altBaslik", e.target.value)} className={inp} />
          </Row>
          <Row label="Adres">
            <input type="text" value={s.adres} onChange={e => set("adres", e.target.value)} className={inp} />
          </Row>
          <Row label="Başlık Boyutu">
            <div className="flex items-center gap-2">
              <input type="range" min={14} max={48} value={s.restoranAdiFs} onChange={e => set("restoranAdiFs", +e.target.value)} className="flex-1" />
              <span className="text-xs w-8 text-right" style={{ color: "var(--text-muted)" }}>{s.restoranAdiFs}</span>
            </div>
          </Row>
        </Section>

        {/* Düzen */}
        <Section title="Düzen" {...sec("Düzen")}>
          <Row label="Kolon">
            <div className="flex gap-2">
              {([1,2,3] as const).map(v => (
                <button key={v} onClick={() => set("kolonSayisi", v)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all"
                  style={{ borderColor: s.kolonSayisi === v ? "var(--gold)" : "var(--border)", backgroundColor: s.kolonSayisi === v ? "var(--gold)" : "transparent", color: s.kolonSayisi === v ? "#fff" : "var(--text)" }}>
                  {v}
                </button>
              ))}
            </div>
          </Row>
          <Row label="Kategori Stil">
            <select value={s.kategoriStil} onChange={e => set("kategoriStil", e.target.value as Settings["kategoriStil"])} className={sel}>
              <option value="cizgi">Çizgi altı</option>
              <option value="kutu">Kutulu (dolu)</option>
              <option value="sadece-yazi">Sadece yazı</option>
            </select>
          </Row>
          <Row label="Fiyat">
            <select value={s.fiyatHizalama} onChange={e => set("fiyatHizalama", e.target.value as Settings["fiyatHizalama"])} className={sel}>
              <option value="sag">Sağa hizalı</option>
              <option value="inline">Ürün adının yanında</option>
            </select>
          </Row>
          <Row label="Fotoğraflar">
            <Toggle value={s.fotografGoster} onChange={v => set("fotografGoster", v)} />
          </Row>
          {s.fotografGoster && (
            <>
              <Row label="Fotoğraf Boyutu">
                <div className="flex items-center gap-2">
                  <input type="range" min={24} max={120} step={4} value={s.fotografBoyut}
                    onChange={e => set("fotografBoyut", +e.target.value)} className="flex-1" />
                  <span className="text-xs w-12 text-right" style={{ color: "var(--text-muted)" }}>{s.fotografBoyut}px</span>
                </div>
              </Row>
              <Row label="Köşe Yarıçapı">
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={60} step={2} value={s.fotografRadius}
                    onChange={e => set("fotografRadius", +e.target.value)} className="flex-1" />
                  <input type="number" min={0} max={999} value={s.fotografRadius}
                    onChange={e => set("fotografRadius", +e.target.value)}
                    className="text-xs w-14 text-right px-1 py-0.5 rounded border outline-none"
                    style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }} />
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>px</span>
                </div>
              </Row>
            </>
          )}
          <Row label="Açıklama">
            <Toggle value={s.aciklamaGoster} onChange={v => set("aciklamaGoster", v)} />
          </Row>
          <Row label="Ad–Fiyat Dolgusu">
            <Toggle value={s.dolguGoster} onChange={v => set("dolguGoster", v)} />
          </Row>
          {s.dolguGoster && (
            <>
              <Row label="Dolgu Stili">
                <div className="grid grid-cols-5 gap-1">
                  {([
                    { key: "nokta",      label: "......" },
                    { key: "cizgi",      label: "──────" },
                    { key: "orta-nokta", label: "· · · ·" },
                    { key: "tire",       label: "- - - -" },
                    { key: "kare",       label: "▪ ▪ ▪ ▪" },
                  ] as const).map(({ key, label }) => (
                    <button key={key} onClick={() => set("dolguStil", key)}
                      className="py-1 rounded text-center border transition-all"
                      style={{
                        fontSize: 9,
                        borderColor: s.dolguStil === key ? "var(--gold)" : "var(--border)",
                        backgroundColor: s.dolguStil === key ? "var(--gold)" : "transparent",
                        color: s.dolguStil === key ? "#fff" : "var(--text-muted)",
                        letterSpacing: "-0.05em",
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </Row>
              <Row label="Dolgu Rengi">
                <div className="flex gap-2 items-center">
                  <input type="color" value={s.dolguRenk} onChange={e => set("dolguRenk", e.target.value)}
                    className="w-7 h-7 rounded border cursor-pointer shrink-0" style={{ padding: 1 }} />
                  <input type="text" value={s.dolguRenk} onChange={e => set("dolguRenk", e.target.value)} className={inp} />
                </div>
              </Row>
            </>
          )}
        </Section>

        {/* Boşluklar */}
        <Section title="Boşluklar" {...sec("Boşluklar" as typeof SECTIONS[number])}>
          <Row label="Kategori Arası">
            <div className="flex items-center gap-2">
              <input type="range" min={8} max={60} step={2} value={s.kategoriAraBoşluk}
                onChange={e => set("kategoriAraBoşluk", +e.target.value)} className="flex-1" />
              <span className="text-xs w-10 text-right" style={{ color: "var(--text-muted)" }}>{s.kategoriAraBoşluk}px</span>
            </div>
          </Row>
          <Row label="Ürün Arası">
            <div className="flex items-center gap-2">
              <input type="range" min={2} max={24} step={1} value={s.urunAraBoşluk}
                onChange={e => set("urunAraBoşluk", +e.target.value)} className="flex-1" />
              <span className="text-xs w-10 text-right" style={{ color: "var(--text-muted)" }}>{s.urunAraBoşluk}px</span>
            </div>
          </Row>
          <Row label="Başlık Alt Boşluk">
            <div className="flex items-center gap-2">
              <input type="range" min={2} max={20} step={1} value={s.kategoriBaslikAlt}
                onChange={e => set("kategoriBaslikAlt", +e.target.value)} className="flex-1" />
              <span className="text-xs w-10 text-right" style={{ color: "var(--text-muted)" }}>{s.kategoriBaslikAlt}px</span>
            </div>
          </Row>
          <Row label="Kolon Arası">
            <div className="flex items-center gap-2">
              <input type="range" min={4} max={30} step={1} value={s.kolonAraBoşluk}
                onChange={e => set("kolonAraBoşluk", +e.target.value)} className="flex-1" />
              <span className="text-xs w-10 text-right" style={{ color: "var(--text-muted)" }}>{s.kolonAraBoşluk}mm</span>
            </div>
          </Row>
          <Row label="Kategori Hizalama">
            <div className="flex gap-1">
              {([["left","◀ Sol"],["center","● Orta"],["right","Sağ ▶"]] as const).map(([v, label]) => (
                <button key={v} onClick={() => set("kategoriHizalama", v)}
                  className="flex-1 py-1.5 rounded text-xs border transition-all"
                  style={{
                    borderColor: s.kategoriHizalama === v ? "var(--gold)" : "var(--border)",
                    backgroundColor: s.kategoriHizalama === v ? "var(--gold)" : "transparent",
                    color: s.kategoriHizalama === v ? "#fff" : "var(--text-muted)",
                  }}>{label}</button>
              ))}
            </div>
          </Row>
        </Section>

        {/* Fontlar */}
        <Section title="Fontlar" {...sec("Fontlar")}>
          <Row label="Başlık Fontu">
            <select value={s.baslikFont} onChange={e => set("baslikFont", e.target.value)} className={sel}>
              {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </Row>
          <Row label="Kategori Fontu">
            <select value={s.kategoriFont} onChange={e => set("kategoriFont", e.target.value)} className={sel}>
              {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </Row>
          <Row label="Ürün Fontu">
            <select value={s.urunFont} onChange={e => set("urunFont", e.target.value)} className={sel}>
              {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </Row>
        </Section>

        {/* Font Boyutları */}
        <Section title="Yazı Boyutları" {...sec("Yazı Boyutları")}>
          {([
            ["Kategori", "kategoriFs"],
            ["Ürün adı", "urunFs"],
            ["Fiyat", "fiyatFs"],
            ["Açıklama", "aciklamaFs"],
          ] as [string, keyof Settings][]).map(([label, key]) => (
            <Row key={key} label={label}>
              <div className="flex items-center gap-2">
                <input type="range" min={7} max={20} value={s[key] as number}
                  onChange={e => set(key, +e.target.value)} className="flex-1" />
                <span className="text-xs w-8 text-right" style={{ color: "var(--text-muted)" }}>{s[key] as number}px</span>
              </div>
            </Row>
          ))}
        </Section>

        {/* Renkler */}
        {/* Çerçeve Bölümü */}
        <Section title="Çerçeve" {...sec("Çerçeve")}>
          {s.cerceveler.length === 0 && (
            <p className="text-xs px-1 pb-1" style={{ color: "var(--text-muted)" }}>Henüz çerçeve eklenmedi.</p>
          )}
          {s.cerceveler.map((c, idx) => (
            <div key={c.id} className="rounded-xl p-3 mb-2" style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: "var(--text)" }}>Çerçeve {idx + 1}</span>
                <button onClick={() => set("cerceveler", s.cerceveler.filter(x => x.id !== c.id))}
                  className="text-xs px-2 py-0.5 rounded" style={{ color: "#EF4444", backgroundColor: "#EF444415" }}>
                  Kaldır
                </button>
              </div>
              <div className="space-y-3">
                {/* Kenar Stili */}
                <div>
                  <p className="text-xs mb-1 font-medium" style={{ color: "var(--text-muted)" }}>Kenar Stili</p>
                  <div className="grid grid-cols-4 gap-1">
                    {([
                      { key: "tek-cizgi",  label: "─────" },
                      { key: "cift-cizgi", label: "══════" },
                      { key: "uc-cizgi",   label: "≡≡≡≡≡" },
                      { key: "noktali",    label: "••••••" },
                      { key: "tire",       label: "– – –" },
                      { key: "wavy",       label: "∿∿∿∿" },
                      { key: "zigzag",     label: "⋀⋀⋀⋀" },
                    ] as const).map(({ key, label }) => (
                      <button key={key}
                        onClick={() => set("cerceveler", s.cerceveler.map(x => x.id === c.id ? { ...x, kenarStil: key } : x))}
                        className="py-1.5 rounded text-center border text-xs transition-all"
                        title={key}
                        style={{
                          borderColor: c.kenarStil === key ? "var(--gold)" : "var(--border)",
                          backgroundColor: c.kenarStil === key ? "var(--gold)" : "transparent",
                          color: c.kenarStil === key ? "#fff" : "var(--text-muted)",
                          letterSpacing: "-0.05em",
                        }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Köşe Efekti */}
                <div>
                  <p className="text-xs mb-1 font-medium" style={{ color: "var(--text-muted)" }}>Köşe Efekti</p>
                  <div className="grid grid-cols-5 gap-1">
                    {([
                      { key: "yok",     label: "Yok" },
                      { key: "rounded", label: "Yuvarlak" },
                      { key: "bevel",   label: "Bevel" },
                      { key: "fancy",   label: "Fancy" },
                      { key: "floral",  label: "Çiçek" },
                    ] as const).map(({ key, label }) => (
                      <button key={key}
                        onClick={() => set("cerceveler", s.cerceveler.map(x => x.id === c.id ? { ...x, kose: key } : x))}
                        className="py-1 rounded text-center border text-xs transition-all"
                        style={{
                          borderColor: c.kose === key ? "var(--gold)" : "var(--border)",
                          backgroundColor: c.kose === key ? "var(--gold)" : "transparent",
                          color: c.kose === key ? "#fff" : "var(--text-muted)",
                        }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Kenar Deseni */}
                <div>
                  <p className="text-xs mb-1 font-medium" style={{ color: "var(--text-muted)" }}>Kenar Deseni</p>
                  <div className="grid grid-cols-3 gap-1">
                    {([
                      { key: "yok",    label: "Yok" },
                      { key: "elmas",  label: "◆ Elmas" },
                      { key: "yildiz", label: "★ Yıldız" },
                      { key: "cicek",  label: "✿ Çiçek" },
                      { key: "yaprak", label: "❧ Yaprak" },
                      { key: "klasik", label: "◉ Klasik" },
                    ] as const).map(({ key, label }) => (
                      <button key={key}
                        onClick={() => set("cerceveler", s.cerceveler.map(x => x.id === c.id ? { ...x, desen: key } : x))}
                        className="py-1 rounded text-center border text-xs transition-all"
                        style={{
                          borderColor: c.desen === key ? "var(--gold)" : "var(--border)",
                          backgroundColor: c.desen === key ? "var(--gold)" : "transparent",
                          color: c.desen === key ? "#fff" : "var(--text-muted)",
                        }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Renk + Opaklık */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Renk</p>
                    <div className="flex gap-1.5 items-center">
                      <input type="color" value={c.renk}
                        onChange={e => set("cerceveler", s.cerceveler.map(x => x.id === c.id ? { ...x, renk: e.target.value } : x))}
                        className="w-7 h-7 rounded border cursor-pointer shrink-0" style={{ padding: 1 }} />
                      <input type="text" value={c.renk}
                        onChange={e => set("cerceveler", s.cerceveler.map(x => x.id === c.id ? { ...x, renk: e.target.value } : x))}
                        className={inp} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Opaklık {Math.round(c.opacity * 100)}%</p>
                    <input type="range" min={0.05} max={1} step={0.05} value={c.opacity}
                      onChange={e => set("cerceveler", s.cerceveler.map(x => x.id === c.id ? { ...x, opacity: +e.target.value } : x))}
                      className="w-full mt-1" />
                  </div>
                </div>

                {/* Kalınlık + İç Boşluk */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Kalınlık {c.kalinlik}px</p>
                    <input type="range" min={0.5} max={6} step={0.5} value={c.kalinlik}
                      onChange={e => set("cerceveler", s.cerceveler.map(x => x.id === c.id ? { ...x, kalinlik: +e.target.value } : x))}
                      className="w-full" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>İç Boşluk {c.icBoşluk}mm</p>
                    <input type="range" min={2} max={20} step={1} value={c.icBoşluk}
                      onChange={e => set("cerceveler", s.cerceveler.map(x => x.id === c.id ? { ...x, icBoşluk: +e.target.value } : x))}
                      className="w-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={() => set("cerceveler", [...s.cerceveler, { id: Date.now(), kenarStil: "tek-cizgi" as KenarStil, kose: "yok" as KoseEfekt, desen: "yok" as KenarDesen, renk: "#1a1a1a", opacity: 1, kalinlik: 1, icBoşluk: 6 }])}
            className="w-full py-2 rounded-xl text-xs font-medium border-2 border-dashed transition-all hover:opacity-80"
            style={{ borderColor: "var(--gold)", color: "var(--gold)" }}>
            + Çerçeve Ekle
          </button>
        </Section>

        <Section title="Renkler" {...sec("Renkler")}>
          {([
            ["Kategori", "kategoriRenk"],
            ["Ürün adı", "urunRenk"],
            ["Fiyat", "fiyatRenk"],
            ["Açıklama", "aciklamaRenk"],
          ] as [string, keyof Settings][]).map(([label, key]) => (
            <Row key={key} label={label}>
              <div className="flex gap-2 items-center">
                <input type="color" value={s[key] as string}
                  onChange={e => set(key, e.target.value)}
                  className="w-7 h-7 rounded border cursor-pointer shrink-0" style={{ padding: 1 }} />
                <input type="text" value={s[key] as string}
                  onChange={e => set(key, e.target.value)} className={inp} />
              </div>
            </Row>
          ))}
        </Section>

        <div className="h-8" />
      </div>

      {/* Sağ önizleme */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-3"
        style={{ backgroundColor: "#e5e7eb" }}>
        <div style={{
          transform: `scale(${SCALE})`,
          transformOrigin: "top center",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
        }}>
          <Preview s={s} items={items} kategoriler={katSira} gizliKat={gizliKat} gizliUrun={gizliUrun} printRef={printRef} />
        </div>
      </div>
    </div>
    </>
  );
}
