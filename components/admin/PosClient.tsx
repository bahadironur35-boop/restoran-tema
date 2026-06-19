"use client";
import { useState, useEffect } from "react";
import { ShoppingCart, Trash2, Plus, Minus, Printer, CreditCard, Banknote, Utensils, Tag, FileText, X } from "lucide-react";

type MenuItem = { id: number; name: string; price: string; category: string; desc: string; image?: string };
type Masa = { id: number; no: number; kapasite: number };
type SepetItem = { menuItemId: number; name: string; price: string; adet: number; not: string };
type SendMode = "mutfak" | "odeme";

const CATEGORIES = [
  { key: "Tümü", emoji: "🍽️" },
  { key: "Başlangıçlar", emoji: "🥗" },
  { key: "Ana Yemekler", emoji: "🥩" },
  { key: "Tatlılar", emoji: "🍮" },
  { key: "İçecekler", emoji: "🥤" },
];

const SERVIS_ORANI = 0.10;

function priceNum(price: string) {
  return Number(price.replace(/[^\d.,]/g, "").replace(",", "."));
}

function formatTL(n: number) {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₺";
}

export default function PosClient() {
  const [masalar, setMasalar] = useState<Masa[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [selectedMasa, setSelectedMasa] = useState<Masa | null>(null);
  const [sepet, setSepet] = useState<SepetItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("Tümü");
  const [notlar, setNotlar] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<SendMode | null>(null);
  const [paket, setPaket] = useState(false);
  const [indirimPct, setIndirimPct] = useState(0);
  const [servisAktif, setServisAktif] = useState(false);
  const [showNotModal, setShowNotModal] = useState(false);
  const [payMethod, setPayMethod] = useState<"nakit" | "kart" | "yemek">("nakit");
  const [search, setSearch] = useState("");
  const [aktifYontemler, setAktifYontemler] = useState<string[]>(["nakit", "kart", "yemek"]);
  const [paketAktif, setPaketAktif] = useState(true);

  useEffect(() => {
    fetch("/api/admin/masalar").then((r) => r.json()).then(setMasalar);
    fetch("/api/menu-public").then((r) => r.json()).then(setMenu);
    fetch("/api/admin/ayarlar").then((r) => r.json()).then((data) => {
      const yontemler = [
        ...(data.odemeNakit  !== "false" ? ["nakit"]  : []),
        ...(data.odemeKart   !== "false" ? ["kart"]   : []),
        ...(data.odemeHavale !== "false" ? ["yemek"]  : []),
      ];
      if (yontemler.length > 0) {
        setAktifYontemler(yontemler);
        setPayMethod(yontemler[0] as "nakit" | "kart" | "yemek");
      }
      if (data.paketSiparisAktif === "false") setPaketAktif(false);
    });
  }, []);

  const addToSepet = (item: MenuItem) => {
    setSepet((prev) => {
      const existing = prev.find((s) => s.menuItemId === item.id);
      if (existing) return prev.map((s) => s.menuItemId === item.id ? { ...s, adet: s.adet + 1 } : s);
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, adet: 1, not: "" }];
    });
  };

  const changeAdet = (menuItemId: number, delta: number) => {
    setSepet((prev) => {
      const item = prev.find((s) => s.menuItemId === menuItemId);
      if (!item) return prev;
      if (item.adet + delta <= 0) return prev.filter((s) => s.menuItemId !== menuItemId);
      return prev.map((s) => s.menuItemId === menuItemId ? { ...s, adet: s.adet + delta } : s);
    });
  };

  const araToplam = sepet.reduce((sum, s) => sum + priceNum(s.price) * s.adet, 0);
  const indirimTutar = araToplam * (indirimPct / 100);
  const servisTutar = servisAktif ? (araToplam - indirimTutar) * SERVIS_ORANI : 0;
  const toplam = araToplam - indirimTutar + servisTutar;

  const sendOrder = async (mode: SendMode) => {
    if (!paket && !selectedMasa && sepet.length === 0) return;
    if (sepet.length === 0) return;
    setSending(true);

    // Sipariş oluştur (paket ise masaId yok)
    await fetch("/api/admin/siparis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        masaId: paket ? null : selectedMasa?.id,
        items: sepet,
        notlar: paket ? `[PAKET] ${notlar}` : notlar,
      }),
    });

    // "Sipariş + Ödeme Al" modunda ödeme kaydı da oluştur
    if (mode === "odeme") {
      await fetch("/api/admin/kasa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          masaId: paket ? null : selectedMasa?.id,
          tutar: toplam,
          yontem: payMethod,
          notlar: paket ? "Paket sipariş" : undefined,
        }),
      });
    }

    setSent(mode);
    setSepet([]);
    setNotlar("");
    setIndirimPct(0);
    setServisAktif(false);
    setSending(false);
    setTimeout(() => setSent(null), 3000);
  };

  const printReceipt = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Adisyon</title><style>
      body{font-family:monospace;max-width:300px;margin:20px auto}
      h2{text-align:center}hr{border:1px dashed #000}
      .row{display:flex;justify-content:space-between}
      .total{font-weight:bold;font-size:1.2em}
    </style></head><body>
      <h2>EatOs</h2>
      <p style="text-align:center">Masa ${selectedMasa?.no ?? ""}</p>
      <hr/>
      ${sepet.map((s) => `<div class="row"><span>${s.name} x${s.adet}</span><span>${formatTL(priceNum(s.price) * s.adet)}</span></div>`).join("")}
      <hr/>
      <div class="row"><span>Ara Toplam</span><span>${formatTL(araToplam)}</span></div>
      ${indirimTutar > 0 ? `<div class="row"><span>Indirim (%${indirimPct})</span><span>-${formatTL(indirimTutar)}</span></div>` : ""}
      ${servisTutar > 0 ? `<div class="row"><span>Hizmet (%10)</span><span>${formatTL(servisTutar)}</span></div>` : ""}
      <hr/>
      <div class="row total"><span>TOPLAM</span><span>${formatTL(toplam)}</span></div>
      <p style="text-align:center;margin-top:20px">Tesekkurler!</p>
    </body></html>`);
    win.print();
  };

  const filteredMenu = menu.filter((m) => {
    const catMatch = activeCategory === "Tümü" || m.category === activeCategory;
    const searchMatch = !search || m.name.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  return (
    <div className="flex gap-0 h-[calc(100vh-73px)] -m-6">

      {/* Sol: Ürün Paneli */}
      <div className="flex flex-col flex-1 min-w-0" style={{ borderRight: "1px solid var(--border)" }}>

        {/* Masa seç */}
        <div className="px-5 py-3 flex items-center gap-3 flex-wrap" style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--bg-card)" }}>
          {/* Paket toggle */}
          {paketAktif && <button
            onClick={() => { setPaket(!paket); setSelectedMasa(null); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0"
            style={paket
              ? { backgroundColor: "#F59E0B20", border: "1.5px solid #F59E0B", color: "#F59E0B" }
              : { backgroundColor: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            📦 Paket
          </button>}

          {!paket && (
            <>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Masa</span>
              <div className="flex gap-2 flex-wrap">
                {masalar.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMasa(m)}
                    className="w-11 h-11 rounded-xl text-sm font-bold transition-all"
                    style={selectedMasa?.id === m.id
                      ? { backgroundColor: "#1A73E8", color: "#fff" }
                      : { backgroundColor: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }
                    }
                  >
                    {m.no}
                  </button>
                ))}
                {masalar.length === 0 && <span className="text-sm" style={{ color: "var(--text-muted)" }}>Önce masa ekleyin</span>}
              </div>
            </>
          )}

          {(selectedMasa || paket) && (
            <span className="ml-auto text-sm font-medium flex items-center gap-1.5" style={{ color: paket ? "#F59E0B" : "#1A73E8" }}>
              <Utensils size={14} />
              {paket ? "Paket / Gel-Al" : `Masa ${selectedMasa!.no} – ${selectedMasa!.kapasite} Kişilik`}
            </span>
          )}
        </div>

        {/* Arama + Kategoriler */}
        <div className="px-5 py-3 space-y-3" style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ürün ara..."
            className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none"
            style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0"
                style={activeCategory === cat.key
                  ? { backgroundColor: "#1A73E8", color: "#fff" }
                  : { backgroundColor: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }
                }
              >
                <span>{cat.emoji}</span>
                {cat.key}
              </button>
            ))}
          </div>
        </div>

        {/* Ürün grid */}
        <div className="flex-1 overflow-y-auto p-5" style={{ backgroundColor: "var(--bg)" }}>
          {filteredMenu.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full" style={{ color: "var(--text-muted)" }}>
              <ShoppingCart size={40} className="mb-3 opacity-30" />
              <p className="text-sm">Ürün bulunamadı</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredMenu.map((item) => {
                const inSepet = sepet.find((s) => s.menuItemId === item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => addToSepet(item)}
                    className="rounded-xl overflow-hidden text-left transition-all hover:shadow-md group relative"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      border: inSepet ? "2px solid #1A73E8" : "1px solid var(--border)",
                      boxShadow: inSepet ? "0 0 0 2px #1A73E820" : undefined,
                    }}
                  >
                    {/* Görsel */}
                    <div className="h-28 overflow-hidden relative" style={{ backgroundColor: "var(--bg)" }}>
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          {CATEGORIES.find((c) => c.key === item.category)?.emoji ?? "🍽️"}
                        </div>
                      )}
                      {inSepet && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "#1A73E8" }}>
                          {inSepet.adet}
                        </div>
                      )}
                    </div>
                    {/* Bilgi */}
                    <div className="p-3">
                      <p className="font-medium text-sm leading-tight mb-0.5" style={{ color: "var(--text)" }}>{item.name}</p>
                      <p className="text-xs line-clamp-1 mb-1.5" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                      <p className="font-bold text-sm" style={{ color: "#1A73E8" }}>{item.price}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sağ: Sipariş Paneli */}
      <div className="w-80 flex flex-col flex-shrink-0" style={{ backgroundColor: "var(--bg-card)" }}>

        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <ShoppingCart size={16} style={{ color: "#1A73E8" }} />
            <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>
              {selectedMasa ? `Masa ${selectedMasa.no} – Sipariş` : "Sipariş"}
            </span>
          </div>
          {sepet.length > 0 && (
            <button onClick={() => setSepet([])} className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors" style={{ color: "#EF4444" }}>
              <Trash2 size={12} /> Temizle
            </button>
          )}
        </div>

        {/* Sipariş listesi */}
        <div className="flex-1 overflow-y-auto">
          {sepet.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16" style={{ color: "var(--text-muted)" }}>
              <ShoppingCart size={36} className="mb-3 opacity-20" />
              <p className="text-sm">Menüden ürün ekleyin</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {sepet.map((s) => (
                <div key={s.menuItemId} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}>
                  {/* Adet kontrolü */}
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => changeAdet(s.menuItemId, -1)} className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
                      <Minus size={11} style={{ color: "var(--text-muted)" }} />
                    </button>
                    <span className="w-5 text-center text-sm font-bold" style={{ color: "var(--text)" }}>{s.adet}</span>
                    <button onClick={() => changeAdet(s.menuItemId, 1)} className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: "#1A73E8" }}>
                      <Plus size={11} color="white" />
                    </button>
                  </div>
                  {/* İsim + fiyat */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{s.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: "var(--text)" }}>
                      {formatTL(priceNum(s.price) * s.adet)}
                    </p>
                    <button onClick={() => setSepet((p) => p.filter((x) => x.menuItemId !== s.menuItemId))}>
                      <X size={12} style={{ color: "var(--text-muted)" }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tutar + Aksiyonlar */}
        {sepet.length > 0 && (
          <div style={{ borderTop: "1px solid var(--border)" }}>
            {/* İndirim & Servis */}
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Ara Toplam</span>
                <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{formatTL(araToplam)}</span>
              </div>
              {/* İndirim seç */}
              <div className="flex items-center gap-2">
                <Tag size={13} style={{ color: "var(--text-muted)" }} />
                <span className="text-xs flex-1" style={{ color: "var(--text-muted)" }}>İndirim</span>
                <div className="flex gap-1">
                  {[0, 5, 10].map((p) => (
                    <button
                      key={p}
                      onClick={() => setIndirimPct(p)}
                      className="px-2 py-0.5 rounded text-xs font-semibold transition-colors"
                      style={indirimPct === p
                        ? { backgroundColor: "#1A73E8", color: "#fff" }
                        : { backgroundColor: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }
                      }
                    >
                      {p === 0 ? "Yok" : `%${p}`}
                    </button>
                  ))}
                </div>
              </div>
              {indirimTutar > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "#22C55E" }}>İndirim (%{indirimPct})</span>
                  <span className="text-xs font-semibold" style={{ color: "#22C55E" }}>-{formatTL(indirimTutar)}</span>
                </div>
              )}
              {/* Servis ücreti */}
              <div className="flex items-center gap-2">
                <Utensils size={13} style={{ color: "var(--text-muted)" }} />
                <span className="text-xs flex-1" style={{ color: "var(--text-muted)" }}>Hizmet Bedeli (%10)</span>
                <button
                  onClick={() => setServisAktif(!servisAktif)}
                  className="w-9 h-5 rounded-full transition-colors relative flex-shrink-0"
                  style={{ backgroundColor: servisAktif ? "#1A73E8" : "var(--border)" }}
                >
                  <span
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: servisAktif ? "18px" : "2px" }}
                  />
                </button>
              </div>
              {servisTutar > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>Hizmet Bedeli</span>
                  <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{formatTL(servisTutar)}</span>
                </div>
              )}
            </div>

            {/* Toplam */}
            <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
              <span className="font-semibold" style={{ color: "var(--text)" }}>Toplam</span>
              <span className="text-xl font-bold" style={{ color: "#1A73E8" }}>{formatTL(toplam)}</span>
            </div>

            {/* Ödeme yöntemi */}
            <div className="px-4 py-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${aktifYontemler.length}, 1fr)` }}>
              {[
                { key: "nakit", label: "Nakit",       icon: Banknote },
                { key: "kart",  label: "Kredi Kartı", icon: CreditCard },
                { key: "yemek", label: "Yemek Kartı", icon: Utensils },
              ].filter((y) => aktifYontemler.includes(y.key)).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setPayMethod(key as typeof payMethod)}
                  className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all"
                  style={payMethod === key
                    ? { backgroundColor: "#1A73E815", border: "1.5px solid #1A73E8", color: "#1A73E8" }
                    : { backgroundColor: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }
                  }
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>

            {/* Butonlar */}
            <div className="px-4 pb-4 space-y-2">
              {sent ? (
                <div className="rounded-xl py-3 text-center text-sm font-semibold" style={{ backgroundColor: "#22C55E20", color: "#22C55E", border: "1px solid #22C55E50" }}>
                  {sent === "odeme" ? "Sipariş & ödeme kaydedildi ✓" : "Mutfağa gönderildi ✓"}
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Mutfağa gönder — ödeme sonra */}
                  {!paket && (
                    <button
                      onClick={() => sendOrder("mutfak")}
                      disabled={(!selectedMasa && !paket) || sepet.length === 0 || sending}
                      className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40"
                      style={{ backgroundColor: "var(--bg)", border: "1.5px solid #1A73E8", color: "#1A73E8" }}
                    >
                      {sending ? "Gönderiliyor..." : "Mutfağa Gönder"}
                    </button>
                  )}
                  {/* Sipariş + Ödeme Al — tek adım */}
                  <button
                    onClick={() => sendOrder("odeme")}
                    disabled={(!selectedMasa && !paket) || sepet.length === 0 || sending}
                    className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-40"
                    style={{ backgroundColor: "#22C55E" }}
                  >
                    {sending ? "İşleniyor..." : paket ? "📦 Sipariş + Ödeme Al" : "Sipariş + Ödeme Al"}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowNotModal(true)}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all"
                  style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
                >
                  <FileText size={13} /> Not Ekle
                </button>
                <button
                  onClick={printReceipt}
                  disabled={sepet.length === 0}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all disabled:opacity-40"
                  style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
                >
                  <Printer size={13} /> Adisyon Yazdır
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Not modal */}
      {showNotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="rounded-2xl p-6 w-96 shadow-2xl" style={{ backgroundColor: "var(--bg-card)" }}>
            <h3 className="font-semibold mb-3" style={{ color: "var(--text)" }}>Sipariş Notu</h3>
            <textarea
              value={notlar}
              onChange={(e) => setNotlar(e.target.value)}
              placeholder="Mutfağa özel not..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
              style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowNotModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#1A73E8", color: "#fff" }}>
                Kaydet
              </button>
              <button onClick={() => setShowNotModal(false)} className="flex-1 py-2.5 rounded-xl text-sm" style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
