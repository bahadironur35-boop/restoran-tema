"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, ChevronDown, ChevronUp } from "lucide-react";

type MenuItem = {
  id: number; name: string; desc: string; price: string;
  category: string; image?: string | null; happyHourPrice?: string | null;
};

type Settings = {
  // Sayfa
  boyut: "A4" | "A5" | "A3" | "kare";
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
  aciklamaGoster: boolean;
  fiyatHizalama: "sag" | "inline";
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
};

const DEFAULT: Settings = {
  boyut: "A4", yon: "dikey", marginMm: 12,
  bgColor: "#ffffff", bgImage: "", bgOpacity: 0.15,
  kolonSayisi: 2, kategoriStil: "cizgi",
  fotografGoster: false, aciklamaGoster: true, fiyatHizalama: "sag",
  logoUrl: "", restoranAdi: "", altBaslik: "", adres: "",
  kategoriRenk: "#1a1a1a", urunRenk: "#1a1a1a", fiyatRenk: "#c8860a", aciklamaRenk: "#666666",
  baslikFont: "Playfair Display", kategoriFont: "Playfair Display", urunFont: "Inter",
  kategoriFs: 14, urunFs: 11, fiyatFs: 11, aciklamaFs: 9, restoranAdiFs: 28,
};

// ── Ayar paneli bölümleri ──────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b" style={{ borderColor: "var(--border)" }}>
      <button className="flex items-center justify-between w-full px-4 py-3 text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--text-muted)" }} onClick={() => setOpen(p => !p)}>
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
  s, items, kategoriler, printRef,
}: {
  s: Settings;
  items: MenuItem[];
  kategoriler: string[];
  printRef: React.RefObject<HTMLDivElement>;
}) {
  const size = PAGE_SIZES[s.boyut];
  const w = s.yon === "dikey" ? size.w : size.h;
  const h = s.yon === "dikey" ? size.h : size.w;
  const MM = 3.7795; // mm → px (96dpi)

  const grouped = kategoriler.reduce<Record<string, MenuItem[]>>((acc, cat) => {
    acc[cat] = items.filter(i => i.category === cat);
    return acc;
  }, {});

  return (
    <div ref={printRef}
      className="relative overflow-hidden"
      style={{
        width: w * MM, height: h * MM,
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

        {/* Kategoriler */}
        <div style={{
          columns: s.kolonSayisi,
          columnGap: s.marginMm * MM,
        }}>
          {kategoriler.map(cat => {
            const catItems = grouped[cat] ?? [];
            if (catItems.length === 0) return null;
            return (
              <div key={cat} style={{ breakInside: "avoid", marginBottom: 14 }}>
                {/* Kategori başlığı */}
                {s.kategoriStil === "kutu" ? (
                  <div style={{
                    backgroundColor: s.kategoriRenk, color: "#fff",
                    fontFamily: s.kategoriFont + ", serif",
                    fontSize: s.kategoriFs, fontWeight: 700,
                    padding: "3px 8px", borderRadius: 4, marginBottom: 6,
                    textTransform: "uppercase", letterSpacing: "0.08em",
                  }}>{cat}</div>
                ) : (
                  <div style={{ marginBottom: 6 }}>
                    <div style={{
                      fontFamily: s.kategoriFont + ", serif",
                      fontSize: s.kategoriFs, fontWeight: 700,
                      color: s.kategoriRenk, textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}>{cat}</div>
                    {s.kategoriStil === "cizgi" && (
                      <div style={{ height: 1, backgroundColor: s.kategoriRenk, opacity: 0.3, marginTop: 2 }} />
                    )}
                  </div>
                )}

                {/* Ürünler */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {catItems.map(item => (
                    <div key={item.id} style={{ display: "flex", gap: 6, breakInside: "avoid" }}>
                      {s.fotografGoster && item.image && (
                        <img src={item.image} alt={item.name}
                          style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: "flex",
                          justifyContent: s.fiyatHizalama === "sag" ? "space-between" : "flex-start",
                          gap: 4, alignItems: "baseline",
                        }}>
                          <span style={{ fontFamily: s.urunFont + ", sans-serif", fontSize: s.urunFs, fontWeight: 600, color: s.urunRenk }}>
                            {item.name}
                          </span>
                          <span style={{ fontFamily: s.urunFont + ", sans-serif", fontSize: s.fiyatFs, fontWeight: 700, color: s.fiyatRenk, whiteSpace: "nowrap" }}>
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
          })}
        </div>
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

  const handlePrint = () => {
    const size = PAGE_SIZES[s.boyut];
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

  const size = PAGE_SIZES[s.boyut];
  const w = s.yon === "dikey" ? size.w : size.h;
  const h = s.yon === "dikey" ? size.h : size.w;
  const MM = 3.7795;
  const SCALE = Math.min(680 / (w * MM), 820 / (h * MM), 1);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>

      {/* Sol panel */}
      <div className="w-80 shrink-0 overflow-y-auto flex flex-col" style={{ backgroundColor: "var(--bg-card)", borderRight: "1px solid var(--border)" }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 shrink-0 sticky top-0 z-10" style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
          <Link href="/admin/menu" className="p-1 rounded hover:bg-white/5">
            <ArrowLeft size={16} style={{ color: "var(--text-muted)" }} />
          </Link>
          <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>Menü Tasarımcısı</span>
          <button onClick={handlePrint}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: "var(--gold)", color: "#fff" }}>
            <Printer size={13} /> Yazdır
          </button>
        </div>

        {/* Sayfa */}
        <Section title="Sayfa">
          <Row label="Boyut">
            <select value={s.boyut} onChange={e => set("boyut", e.target.value as Settings["boyut"])} className={sel}>
              <option value="A4">A4 (210×297mm)</option>
              <option value="A5">A5 (148×210mm)</option>
              <option value="A3">A3 (297×420mm)</option>
              <option value="kare">Kare (210×210mm)</option>
            </select>
          </Row>
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
        <Section title="Zemin">
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
        <Section title="Restoran Başlığı">
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
        <Section title="Düzen">
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
            <button onClick={() => set("fotografGoster", !s.fotografGoster)}
              className="text-xs px-3 py-1.5 rounded-lg border transition-all"
              style={{ borderColor: s.fotografGoster ? "var(--gold)" : "var(--border)", backgroundColor: s.fotografGoster ? "var(--gold)" : "transparent", color: s.fotografGoster ? "#fff" : "var(--text)" }}>
              {s.fotografGoster ? "Göster" : "Gizle"}
            </button>
          </Row>
          <Row label="Açıklama">
            <button onClick={() => set("aciklamaGoster", !s.aciklamaGoster)}
              className="text-xs px-3 py-1.5 rounded-lg border transition-all"
              style={{ borderColor: s.aciklamaGoster ? "var(--gold)" : "var(--border)", backgroundColor: s.aciklamaGoster ? "var(--gold)" : "transparent", color: s.aciklamaGoster ? "#fff" : "var(--text)" }}>
              {s.aciklamaGoster ? "Göster" : "Gizle"}
            </button>
          </Row>
        </Section>

        {/* Fontlar */}
        <Section title="Fontlar">
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
        <Section title="Yazı Boyutları">
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
                <span className="text-xs w-8 text-right" style={{ color: "var(--text-muted)" }}>{s[key]}px</span>
              </div>
            </Row>
          ))}
        </Section>

        {/* Renkler */}
        <Section title="Renkler">
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
      <div className="flex-1 overflow-auto flex items-start justify-center p-8"
        style={{ backgroundColor: "#e5e7eb" }}>
        <div style={{
          transform: `scale(${SCALE})`,
          transformOrigin: "top center",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
        }}>
          <Preview s={s} items={items} kategoriler={kategoriler} printRef={printRef} />
        </div>
      </div>
    </div>
  );
}
