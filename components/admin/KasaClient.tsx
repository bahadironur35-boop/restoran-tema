"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { CreditCard, Banknote, Building2, X, CheckCircle, Printer, Scissors } from "lucide-react";

type SiparisItem = { id: number; name: string; price: string; adet: number; not: string | null };
type Siparis = { id: number; durum: string; notlar: string | null; items: SiparisItem[] };
type MasaHesap = { id: number; no: number; alan: string; siparisler: Siparis[]; tutar: number };
type FisData = { masa: MasaHesap; yontem: string; notlar: string; restaurantName: string; saat: string };

// Tüm ürünleri düz liste olarak döner (adet bazlı — 2× Burger → 2 ayrı satır)
function tumUrunler(masa: MasaHesap): { key: string; name: string; price: number; sipId: number; itemId: number; idx: number }[] {
  const list: ReturnType<typeof tumUrunler> = [];
  for (const s of masa.siparisler) {
    for (const item of s.items) {
      const birimFiyat = parsePrice(item.price);
      for (let i = 0; i < item.adet; i++) {
        list.push({ key: `${item.id}-${i}`, name: item.name, price: birimFiyat, sipId: s.id, itemId: item.id, idx: i });
      }
    }
  }
  return list;
}

const TUM_YONTEMLER = [
  { key: "nakit",  label: "Nakit",  icon: Banknote,  color: "#16A34A", ayar: "odemeNakit" },
  { key: "kart",   label: "Kart",   icon: CreditCard, color: "#1A73E8", ayar: "odemeKart" },
  { key: "havale", label: "Havale", icon: Building2,  color: "#8B5CF6", ayar: "odemeHavale" },
];

function fmt(n: number) {
  return "₺" + n.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function parsePrice(p: string) {
  return parseFloat(p.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
}

type BolTab = "esit" | "urun";

export default function KasaClient() {
  const [masalar, setMasalar]     = useState<MasaHesap[]>([]);
  const [loading, setLoading]     = useState(false);
  const [secili, setSecili]       = useState<MasaHesap | null>(null);
  const [yontem, setYontem]       = useState("nakit");
  const [notlar, setNotlar]       = useState("");
  const [odemeAlindi, setOdemeAlindi] = useState(false);
  const [odemeLoading, setOdemeLoading] = useState(false);
  const [yontemler, setYontemler] = useState(TUM_YONTEMLER);
  const [fis, setFis]             = useState<FisData | null>(null);
  const [restaurantName, setRestaurantName] = useState("EatOs");
  const fisRef = useRef<HTMLDivElement>(null);

  // --- Adisyon bölme state'leri ---
  const [bolModal, setBolModal]       = useState(false);
  const [bolTab, setBolTab]           = useState<BolTab>("esit");
  const [bolYontem, setBolYontem]     = useState("nakit");
  // Eşit bölme
  const [kisiSayisi, setKisiSayisi]   = useState(2);
  const [odenmisPay, setOdenmisPay]   = useState<number[]>([]); // ödenen pay indeksleri
  const [payYukleniyor, setPayYukleniyor] = useState<number | null>(null);
  // Ürün bazlı bölme
  const [seciliUrunler, setSeciliUrunler] = useState<Set<string>>(new Set());
  const [odenmisUrunler, setOdenmisUrunler] = useState<Set<string>>(new Set());
  const [urunYukleniyor, setUrunYukleniyor] = useState(false);

  useEffect(() => {
    fetch("/api/admin/ayarlar").then((r) => r.json()).then((data) => {
      const aktif = TUM_YONTEMLER.filter((y) => data[y.ayar] !== "false");
      setYontemler(aktif.length > 0 ? aktif : TUM_YONTEMLER);
      setYontem(aktif[0]?.key ?? "nakit");
      if (data.restaurantName) setRestaurantName(data.restaurantName);
    });
  }, []);

  const fetchMasalar = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/kasa");
    setMasalar(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMasalar();
    const iv = setInterval(fetchMasalar, 15000);
    return () => clearInterval(iv);
  }, [fetchMasalar]);

  const odemeAl = async () => {
    if (!secili) return;
    setOdemeLoading(true);
    await fetch("/api/admin/kasa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masaId: secili.id, tutar: secili.tutar, yontem, notlar }),
    });
    setOdemeLoading(false);
    setOdemeAlindi(true);
    setFis({
      masa: secili,
      yontem,
      notlar,
      restaurantName,
      saat: new Date().toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    });
  };

  const kapat = () => {
    setOdemeAlindi(false);
    setFis(null);
    setSecili(null);
    setNotlar("");
    setYontem("nakit");
    fetchMasalar();
  };

  const bolAc = () => {
    setBolTab("esit");
    setKisiSayisi(2);
    setOdenmisPay([]);
    setSeciliUrunler(new Set());
    setOdenmisUrunler(new Set());
    setBolYontem(yontemler[0]?.key ?? "nakit");
    setBolModal(true);
  };

  const payOde = async (payIdx: number, tutar: number, sonPay: boolean) => {
    if (!secili) return;
    setPayYukleniyor(payIdx);
    await fetch("/api/admin/kasa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masaId: secili.id, tutar, yontem: bolYontem, notlar: `Pay ${payIdx + 1}/${kisiSayisi}`, parcali: !sonPay }),
    });
    setOdenmisPay((p) => [...p, payIdx]);
    setPayYukleniyor(null);
    if (sonPay) { setBolModal(false); kapat(); }
  };

  const urunPayOde = async (sonPay: boolean) => {
    if (!secili || seciliUrunler.size === 0) return;
    const urunList = tumUrunler(secili);
    const secilenler = urunList.filter((u) => seciliUrunler.has(u.key));
    const tutar = secilenler.reduce((s, u) => s + u.price, 0);
    setUrunYukleniyor(true);
    await fetch("/api/admin/kasa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masaId: secili.id, tutar, yontem: bolYontem, notlar: `Ürün bazlı pay`, parcali: !sonPay }),
    });
    setOdenmisUrunler((prev) => new Set([...prev, ...seciliUrunler]));
    setSeciliUrunler(new Set());
    setUrunYukleniyor(false);
    if (sonPay) { setBolModal(false); kapat(); }
  };

  const yazdir = () => {
    const el = fisRef.current;
    if (!el) return;
    const win = window.open("", "_blank", "width=320,height=600");
    if (!win) return;
    win.document.write(`<html><head><title>Fiş</title><style>
      body{font-family:monospace;font-size:12px;margin:16px;color:#000}
      h2{text-align:center;font-size:15px;margin:0 0 4px}
      .center{text-align:center}
      .row{display:flex;justify-content:space-between;margin:2px 0}
      .divider{border-top:1px dashed #000;margin:8px 0}
      .total{font-size:16px;font-weight:bold}
      @media print{body{margin:0}}
    </style></head><body>${el.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  const toplamCiro = masalar.reduce((s, m) => s + m.tutar, 0);

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--text)" }}>Kasa</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Açık hesaplar · 15sn'de bir güncellenir
          </p>
        </div>
        {masalar.length > 0 && (
          <div className="card px-5 py-3 text-right">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Toplam Açık Hesap</p>
            <p className="text-2xl font-bold" style={{ color: "#22C55E" }}>{fmt(toplamCiro)}</p>
          </div>
        )}
      </div>

      {/* Masa kartları */}
      {loading && masalar.length === 0 ? (
        <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>Yükleniyor...</div>
      ) : masalar.length === 0 ? (
        <div className="card p-16 text-center space-y-3">
          <CheckCircle size={40} className="mx-auto opacity-20" style={{ color: "var(--text-muted)" }} />
          <p className="font-medium" style={{ color: "var(--text-muted)" }}>Açık hesap yok</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Dolu masalar burada görünür</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {masalar.map((m) => (
            <button
              key={m.id}
              onClick={() => { setSecili(m); setYontem("nakit"); setNotlar(""); }}
              className="card p-5 text-left transition-all hover:shadow-lg hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-2xl font-bold" style={{ color: "#1A73E8" }}>{m.no}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{m.alan}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ backgroundColor: "#EF444415", color: "#EF4444" }}>
                  Dolu
                </span>
              </div>
              <p className="text-xl font-bold mb-1" style={{ color: "#22C55E" }}>{fmt(m.tutar)}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {m.siparisler.reduce((s, si) => s + si.items.reduce((a, i) => a + i.adet, 0), 0)} ürün ·{" "}
                {m.siparisler.length} sipariş
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Gizli fiş — yazdırma için */}
      {fis && (
        <div ref={fisRef} style={{ display: "none" }}>
          <h2>{fis.restaurantName}</h2>
          <p className="center">{fis.saat}</p>
          <p className="center">Masa {fis.masa.no} · {fis.masa.alan}</p>
          <div className="divider" />
          {fis.masa.siparisler.map((s) =>
            s.items.map((item) => (
              <div key={item.id} className="row">
                <span>{item.adet}× {item.name}</span>
                <span>{fmt(parsePrice(item.price) * item.adet)}</span>
              </div>
            ))
          )}
          <div className="divider" />
          <div className="row total">
            <span>TOPLAM</span>
            <span>{fmt(fis.masa.tutar)}</span>
          </div>
          <div className="row">
            <span>Ödeme</span>
            <span>{TUM_YONTEMLER.find((y) => y.key === fis.yontem)?.label ?? fis.yontem}</span>
          </div>
          {fis.notlar && <p>Not: {fis.notlar}</p>}
          <div className="divider" />
          <p className="center">Teşekkürler!</p>
        </div>
      )}

      {/* Detay / ödeme modal */}
      {secili && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
          <div className="rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <div>
                <p className="font-bold text-base" style={{ color: "var(--text)" }}>
                  Masa {secili.no} · {secili.alan}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Hesap Detayı</p>
              </div>
              <button onClick={() => setSecili(null)}>
                <X size={18} style={{ color: "var(--text-muted)" }} />
              </button>
            </div>

            {/* Sipariş detayları */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {secili.siparisler.map((s) => (
                <div key={s.id}>
                  <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                    Sipariş #{s.id}
                  </p>
                  {s.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-1.5">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-sm w-6" style={{ color: "#1A73E8" }}>{item.adet}×</span>
                        <div>
                          <span className="text-sm" style={{ color: "var(--text)" }}>{item.name}</span>
                          {item.not && <p className="text-xs" style={{ color: "#F59E0B" }}>{item.not}</p>}
                        </div>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                        {fmt(parsePrice(item.price) * item.adet)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}

              {/* Toplam */}
              <div className="border-t pt-3 flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                <span className="font-bold" style={{ color: "var(--text)" }}>Toplam</span>
                <span className="text-2xl font-bold" style={{ color: "#22C55E" }}>{fmt(secili.tutar)}</span>
              </div>

              {/* Ödeme yöntemi */}
              <div>
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                  Ödeme Yöntemi
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {yontemler.map((y) => {
                    const Icon = y.icon;
                    return (
                      <button
                        key={y.key}
                        onClick={() => setYontem(y.key)}
                        className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all"
                        style={yontem === y.key
                          ? { backgroundColor: `${y.color}20`, border: `2px solid ${y.color}`, color: y.color }
                          : { backgroundColor: "var(--bg)", border: "2px solid transparent", color: "var(--text-muted)" }
                        }
                      >
                        <Icon size={18} />
                        <span className="text-xs font-semibold">{y.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Not */}
              <div>
                <p className="text-xs uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Not (isteğe bağlı)
                </p>
                <input
                  value={notlar}
                  onChange={(e) => setNotlar(e.target.value)}
                  className="input-field w-full"
                  placeholder="Fiş no, indirim vb."
                />
              </div>
            </div>

            {/* Ödeme butonu */}
            <div className="px-6 py-4 border-t space-y-2" style={{ borderColor: "var(--border)" }}>
              {odemeAlindi ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold"
                    style={{ backgroundColor: "#16A34A" }}>
                    <CheckCircle size={18} /> Ödeme Alındı
                  </div>
                  <div className="flex gap-2">
                    <button onClick={yazdir}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold rounded-xl transition-colors"
                      style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                      <Printer size={14} /> Fiş Yazdır
                    </button>
                    <button onClick={kapat}
                      className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white"
                      style={{ backgroundColor: "#1A73E8" }}>
                      Kapat
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={odemeAl}
                    disabled={odemeLoading}
                    className="w-full py-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: yontemler.find((y) => y.key === yontem)?.color ?? "#16A34A" }}
                  >
                    {odemeLoading ? "İşleniyor..." : (
                      <>
                        {yontem === "nakit" && <Banknote size={16} />}
                        {yontem === "kart"  && <CreditCard size={16} />}
                        {yontem === "havale" && <Building2 size={16} />}
                        {fmt(secili.tutar)} · Ödemeyi Al
                      </>
                    )}
                  </button>
                  <button onClick={bolAc}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                    style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                    <Scissors size={14} /> Adisyonu Böl
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Adisyon Bölme Modalı */}
      {bolModal && secili && (() => {
        const urunList = tumUrunler(secili);
        const kalanUrunler = urunList.filter((u) => !odenmisUrunler.has(u.key));
        const seciliToplam = urunList.filter((u) => seciliUrunler.has(u.key)).reduce((s, u) => s + u.price, 0);
        const odenmisUrunToplam = urunList.filter((u) => odenmisUrunler.has(u.key)).reduce((s, u) => s + u.price, 0);
        const kalanToplam = secili.tutar - odenmisUrunToplam;
        const payBasina = kisiSayisi > 0 ? secili.tutar / kisiSayisi : 0;
        const tumPaylarOdendi = odenmisPay.length === kisiSayisi;
        const tumUrunlerOdendi = odenmisUrunler.size === urunList.length;

        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
            <div className="rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>

              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                <div>
                  <p className="font-bold text-base" style={{ color: "var(--text)" }}>
                    Adisyonu Böl · Masa {secili.no}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Toplam: {fmt(secili.tutar)}</p>
                </div>
                <button onClick={() => setBolModal(false)}>
                  <X size={18} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>

              {/* Tab seçici */}
              <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
                {([["esit", "Eşit Böl"], ["urun", "Ürün Seç"]] as [BolTab, string][]).map(([key, label]) => (
                  <button key={key} onClick={() => setBolTab(key)}
                    className="flex-1 py-3 text-sm font-semibold transition-colors"
                    style={bolTab === key
                      ? { color: "#1A73E8", borderBottom: "2px solid #1A73E8" }
                      : { color: "var(--text-muted)" }}>
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

                {/* Ödeme yöntemi (her iki tab için) */}
                <div>
                  <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Ödeme Yöntemi</p>
                  <div className="grid grid-cols-3 gap-2">
                    {yontemler.map((y) => {
                      const Icon = y.icon;
                      return (
                        <button key={y.key} onClick={() => setBolYontem(y.key)}
                          className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all"
                          style={bolYontem === y.key
                            ? { backgroundColor: `${y.color}20`, border: `2px solid ${y.color}`, color: y.color }
                            : { backgroundColor: "var(--bg)", border: "2px solid transparent", color: "var(--text-muted)" }}>
                          <Icon size={18} />
                          <span className="text-xs font-semibold">{y.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* EŞİT BÖL */}
                {bolTab === "esit" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium" style={{ color: "var(--text)" }}>Kişi sayısı:</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setKisiSayisi((n) => Math.max(2, n - 1))}
                          className="w-8 h-8 rounded-lg text-lg font-bold flex items-center justify-center"
                          style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}>−</button>
                        <span className="w-8 text-center font-bold text-lg" style={{ color: "var(--text)" }}>{kisiSayisi}</span>
                        <button onClick={() => setKisiSayisi((n) => n + 1)}
                          className="w-8 h-8 rounded-lg text-lg font-bold flex items-center justify-center"
                          style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}>+</button>
                      </div>
                      <span className="ml-auto font-bold text-lg" style={{ color: "#22C55E" }}>{fmt(payBasina)} / kişi</span>
                    </div>

                    <div className="space-y-2">
                      {Array.from({ length: kisiSayisi }, (_, i) => {
                        const odendi = odenmisPay.includes(i);
                        const yukleniyor = payYukleniyor === i;
                        const sonPay = odenmisPay.length === kisiSayisi - 1 && !odendi;
                        return (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                            style={{ backgroundColor: odendi ? "#16A34A15" : "var(--bg)", border: `1px solid ${odendi ? "#16A34A40" : "var(--border)"}` }}>
                            <div className="flex items-center gap-3">
                              {odendi
                                ? <CheckCircle size={16} style={{ color: "#16A34A" }} />
                                : <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: "var(--border)" }} />}
                              <span className="text-sm font-medium" style={{ color: "var(--text)" }}>Pay {i + 1}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm" style={{ color: odendi ? "#16A34A" : "var(--text)" }}>{fmt(payBasina)}</span>
                              {!odendi && (
                                <button onClick={() => payOde(i, payBasina, sonPay)}
                                  disabled={yukleniyor}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-50"
                                  style={{ backgroundColor: yontemler.find((y) => y.key === bolYontem)?.color ?? "#1A73E8" }}>
                                  {yukleniyor ? "..." : sonPay ? "Son Pay Al ✓" : "Al"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {tumPaylarOdendi && (
                      <div className="flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold"
                        style={{ backgroundColor: "#16A34A" }}>
                        <CheckCircle size={16} /> Tüm Paylar Ödendi
                      </div>
                    )}
                  </div>
                )}

                {/* ÜRÜN SEÇ */}
                {bolTab === "urun" && (
                  <div className="space-y-3">
                    {odenmisUrunler.size > 0 && (
                      <p className="text-xs px-3 py-2 rounded-lg"
                        style={{ backgroundColor: "#16A34A15", color: "#16A34A", border: "1px solid #16A34A30" }}>
                        ✓ {odenmisUrunler.size} ürün ödendi · Kalan: {fmt(kalanToplam)}
                      </p>
                    )}

                    {kalanUrunler.length === 0 ? (
                      <div className="flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold"
                        style={{ backgroundColor: "#16A34A" }}>
                        <CheckCircle size={16} /> Tüm Ürünler Ödendi
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-2 mb-1">
                          <button onClick={() => setSeciliUrunler(new Set(kalanUrunler.map((u) => u.key)))}
                            className="text-xs px-2 py-1 rounded-lg"
                            style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                            Tümünü Seç
                          </button>
                          <button onClick={() => setSeciliUrunler(new Set())}
                            className="text-xs px-2 py-1 rounded-lg"
                            style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                            Temizle
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          {kalanUrunler.map((u) => {
                            const secili2 = seciliUrunler.has(u.key);
                            return (
                              <button key={u.key} onClick={() => {
                                const next = new Set(seciliUrunler);
                                secili2 ? next.delete(u.key) : next.add(u.key);
                                setSeciliUrunler(next);
                              }}
                                className="w-full flex items-center justify-between p-3 rounded-xl transition-all text-left"
                                style={{
                                  backgroundColor: secili2 ? "#1A73E815" : "var(--bg)",
                                  border: `1px solid ${secili2 ? "#1A73E8" : "var(--border)"}`,
                                }}>
                                <div className="flex items-center gap-3">
                                  <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: secili2 ? "#1A73E8" : "transparent", border: `2px solid ${secili2 ? "#1A73E8" : "var(--border)"}` }}>
                                    {secili2 && <span className="text-white text-xs">✓</span>}
                                  </div>
                                  <span className="text-sm" style={{ color: "var(--text)" }}>{u.name}</span>
                                </div>
                                <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{fmt(u.price)}</span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {seciliUrunler.size > 0 && (
                      <div className="border-t pt-3 flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                        <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                          {seciliUrunler.size} ürün seçildi
                        </span>
                        <span className="font-bold" style={{ color: "#22C55E" }}>{fmt(seciliToplam)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Alt buton */}
              {bolTab === "urun" && !tumUrunlerOdendi && seciliUrunler.size > 0 && (
                <div className="px-6 py-4 border-t" style={{ borderColor: "var(--border)" }}>
                  {(() => {
                    const kalanSonra = kalanUrunler.filter((u) => !seciliUrunler.has(u.key)).length;
                    const sonPay = kalanSonra === 0;
                    return (
                      <button onClick={() => urunPayOde(sonPay)} disabled={urunYukleniyor}
                        className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        style={{ backgroundColor: yontemler.find((y) => y.key === bolYontem)?.color ?? "#1A73E8" }}>
                        {urunYukleniyor ? "İşleniyor..." : `${fmt(seciliToplam)} · ${sonPay ? "Son Payı Al ✓" : "Bu Payı Al"}`}
                      </button>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
