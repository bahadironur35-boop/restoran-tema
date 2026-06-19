"use client";
import { useState, useEffect, useCallback } from "react";
import { TrendingUp, ShoppingBag, Receipt, BarChart2, Banknote, CreditCard, Building2, Wallet, Download, FileSpreadsheet, FileCode, FileJson } from "lucide-react";
import * as XLSX from "xlsx";

type GunlukTrend   = { tarih: string; gelir: number; adet: number };
type PopulerUrun   = { name: string; adet: number; gelir: number };
type MasaGelir     = { no: number; alan: string; gelir: number; siparisSayisi: number; ortalama: number };
type OdemeDagilim  = { yontem: string; adet: number; tutar: number };

type Rapor = {
  toplamGelir: number;
  kasaGelir: number;
  siparisAdedi: number;
  ortalamaFatura: number;
  gunlukTrend: GunlukTrend[];
  populerUrunler: PopulerUrun[];
  masaBaziGelir: MasaGelir[];
  odemeDagilimi: OdemeDagilim[];
};

const ODEME_CONFIG: Record<string, { label: string; icon: typeof Banknote; color: string; bg: string }> = {
  nakit:  { label: "Nakit",  icon: Banknote,   color: "#16A34A", bg: "#16A34A15" },
  kart:   { label: "Kart",   icon: CreditCard,  color: "#1A73E8", bg: "#1A73E815" },
  havale: { label: "Havale", icon: Building2,   color: "#8B5CF6", bg: "#8B5CF615" },
};

const PERIODS = [
  { key: "gunluk",   label: "Bugün" },
  { key: "haftalik", label: "Son 7 Gün" },
  { key: "aylik",    label: "Son 30 Gün" },
];

function fmt(n: number) {
  return "₺" + n.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function tarihLabel(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

const today = new Date().toISOString().split("T")[0];
const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().split("T")[0];

export default function RaporlarClient() {
  const [period, setPeriod]       = useState("haftalik");
  const [ozelAralik, setOzelAralik] = useState(false);
  const [baslangic, setBaslangic] = useState(weekAgo);
  const [bitis, setBitis]         = useState(today);
  const [rapor, setRapor]         = useState<Rapor | null>(null);
  const [loading, setLoading]     = useState(false);

  const fetchRapor = useCallback(async () => {
    setLoading(true);
    const url = ozelAralik
      ? `/api/admin/raporlar?baslangic=${baslangic}&bitis=${bitis}`
      : `/api/admin/raporlar?period=${period}`;
    const res = await fetch(url);
    setRapor(await res.json());
    setLoading(false);
  }, [period, ozelAralik, baslangic, bitis]);

  useEffect(() => { fetchRapor(); }, [fetchRapor]);

  const exportCSV = () => {
    if (!rapor) return;
    const rows: string[][] = [];
    const donem = ozelAralik ? `${baslangic} – ${bitis}` : PERIODS.find((p) => p.key === period)?.label ?? period;

    rows.push(["ÖZET", donem]);
    rows.push(["Sipariş Geliri", String(rapor.toplamGelir)]);
    rows.push(["Kasa Tahsilatı", String(rapor.kasaGelir)]);
    rows.push(["Sipariş Adedi", String(rapor.siparisAdedi)]);
    rows.push(["Ortalama Fatura", String(rapor.ortalamaFatura.toFixed(2))]);
    rows.push([]);

    rows.push(["GELİR TRENDİ"]);
    rows.push(["Tarih", "Gelir (₺)", "Sipariş Adedi"]);
    rapor.gunlukTrend.forEach((g) => rows.push([g.tarih, String(g.gelir), String(g.adet)]));
    rows.push([]);

    rows.push(["EN ÇOK SATILAN ÜRÜNLER"]);
    rows.push(["Ürün", "Adet", "Gelir (₺)"]);
    rapor.populerUrunler.forEach((u) => rows.push([u.name, String(u.adet), String(u.gelir)]));
    rows.push([]);

    rows.push(["MASA BAZLI GELİR"]);
    rows.push(["Masa No", "Alan", "Gelir (₺)", "Sipariş Sayısı", "Ortalama (₺)"]);
    rapor.masaBaziGelir.forEach((m) => rows.push([String(m.no), m.alan, String(m.gelir), String(m.siparisSayisi), String(m.ortalama.toFixed(2))]));
    rows.push([]);

    rows.push(["ÖDEME YÖNTEMİ DAĞILIMI"]);
    rows.push(["Yöntem", "İşlem Sayısı", "Tutar (₺)"]);
    rapor.odemeDagilimi.forEach((o) => rows.push([o.yontem, String(o.adet), String(o.tutar)]));

    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapor_${donem.replace(/\s/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const donemLabel = ozelAralik ? `${baslangic}_${bitis}` : (PERIODS.find((p) => p.key === period)?.label ?? period);

  const exportExcel = () => {
    if (!rapor) return;
    const wb = XLSX.utils.book_new();

    // Özet sayfası
    const ozet = [
      ["Dönem", donemLabel],
      ["Sipariş Geliri (₺)", rapor.toplamGelir],
      ["Kasa Tahsilatı (₺)", rapor.kasaGelir],
      ["Sipariş Adedi", rapor.siparisAdedi],
      ["Ortalama Fatura (₺)", parseFloat(rapor.ortalamaFatura.toFixed(2))],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ozet), "Özet");

    // Günlük trend
    const trend = [["Tarih", "Gelir (₺)", "Sipariş Adedi"], ...rapor.gunlukTrend.map((g) => [g.tarih, g.gelir, g.adet])];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(trend), "Günlük Trend");

    // Ürünler
    const urunler = [["Ürün", "Adet", "Gelir (₺)"], ...rapor.populerUrunler.map((u) => [u.name, u.adet, u.gelir])];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(urunler), "Ürünler");

    // Masa bazlı
    const masalar = [["Masa No", "Alan", "Gelir (₺)", "Sipariş Sayısı", "Ortalama (₺)"],
      ...rapor.masaBaziGelir.map((m) => [m.no, m.alan, m.gelir, m.siparisSayisi, parseFloat(m.ortalama.toFixed(2))])];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(masalar), "Masa Bazlı");

    // Ödeme dağılımı
    const odemeler = [["Yöntem", "İşlem Sayısı", "Tutar (₺)"], ...rapor.odemeDagilimi.map((o) => [o.yontem, o.adet, o.tutar])];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(odemeler), "Ödemeler");

    XLSX.writeFile(wb, `rapor_${donemLabel}.xlsx`);
  };

  const exportLogoXML = () => {
    if (!rapor) return;
    const simdi = new Date().toISOString();
    const satirlar = rapor.odemeDagilimi.map((o, i) => `
    <INVOICE_LINE>
      <LINE_NO>${i + 1}</LINE_NO>
      <DESCRIPTION>${o.yontem.charAt(0).toUpperCase() + o.yontem.slice(1)} Tahsilatı</DESCRIPTION>
      <QUANTITY>${o.adet}</QUANTITY>
      <UNIT_PRICE>${(o.tutar / (o.adet || 1)).toFixed(2)}</UNIT_PRICE>
      <TOTAL>${o.tutar.toFixed(2)}</TOTAL>
      <VAT_RATE>8</VAT_RATE>
    </INVOICE_LINE>`).join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<LOGO_DATA>
  <EXPORT_DATE>${simdi}</EXPORT_DATE>
  <PERIOD>${donemLabel}</PERIOD>
  <INVOICE>
    <INVOICE_DATE>${new Date().toISOString().split("T")[0]}</INVOICE_DATE>
    <TOTAL_AMOUNT>${rapor.kasaGelir.toFixed(2)}</TOTAL_AMOUNT>
    <CURRENCY>TRY</CURRENCY>
    <LINES>${satirlar}
    </LINES>
  </INVOICE>
</LOGO_DATA>`;

    const blob = new Blob([xml], { type: "application/xml;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `logo_rapor_${donemLabel}.xml`; a.click();
  };

  const exportParasutJSON = () => {
    if (!rapor) return;
    const veri = {
      meta: { kaynak: "EatOs", donem: donemLabel, olusturulma: new Date().toISOString() },
      ozet: {
        toplamGelir: rapor.toplamGelir,
        kasaTahsilati: rapor.kasaGelir,
        siparisAdedi: rapor.siparisAdedi,
        ortalamaFatura: parseFloat(rapor.ortalamaFatura.toFixed(2)),
      },
      odemeler: rapor.odemeDagilimi.map((o) => ({
        yontem: o.yontem, islemSayisi: o.adet, toplam: o.tutar,
      })),
      gunlukTrend: rapor.gunlukTrend,
      populerUrunler: rapor.populerUrunler,
    };
    const blob = new Blob([JSON.stringify(veri, null, 2)], { type: "application/json;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `parasut_rapor_${donemLabel}.json`; a.click();
  };

  const maxGelir = rapor ? Math.max(...rapor.gunlukTrend.map((g) => g.gelir), 1) : 1;
  const maxUrun  = rapor ? Math.max(...rapor.populerUrunler.map((u) => u.adet), 1) : 1;
  const maxMasa  = rapor ? Math.max(...rapor.masaBaziGelir.map((m) => m.gelir), 1) : 1;

  const URUN_COLORS = ["#1A73E8", "#8B5CF6", "#F59E0B", "#22C55E", "#EF4444",
                       "#06B6D4", "#EC4899", "#84CC16", "#F97316", "#6366F1"];

  return (
    <div className="space-y-6">

      {/* Başlık + Dönem seçici */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-semibold" style={{ color: "var(--text)" }}>Raporlar</h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Teslim edilen siparişler baz alınır
            </p>
          </div>
          {rapor && (
            <div className="flex items-center gap-1.5">
              {[
                { label: "CSV",   icon: Download,         fn: exportCSV,        title: "Excel/Numbers uyumlu" },
                { label: "Excel", icon: FileSpreadsheet,  fn: exportExcel,      title: "Çok sayfalı .xlsx" },
                { label: "Logo",  icon: FileCode,         fn: exportLogoXML,    title: "Logo Tiger/GO XML" },
                { label: "JSON",  icon: FileJson,         fn: exportParasutJSON,title: "Paraşüt/Mikro API" },
              ].map((btn) => {
                const Icon = btn.icon;
                return (
                  <button key={btn.label} onClick={btn.fn} title={btn.title}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors"
                    style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                    <Icon size={12} /> {btn.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2 flex-wrap justify-end">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => { setPeriod(p.key); setOzelAralik(false); }}
                className="px-4 py-2 text-xs font-semibold rounded-lg transition-all"
                style={!ozelAralik && period === p.key
                  ? { backgroundColor: "#1A73E8", color: "#fff" }
                  : { backgroundColor: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }
                }
              >
                {p.label}
              </button>
            ))}
            <button
              onClick={() => setOzelAralik(true)}
              className="px-4 py-2 text-xs font-semibold rounded-lg transition-all"
              style={ozelAralik
                ? { backgroundColor: "#8B5CF6", color: "#fff" }
                : { backgroundColor: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }
              }
            >
              Özel Aralık
            </button>
          </div>

          {/* Tarih aralığı inputları */}
          {ozelAralik && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={baslangic}
                max={bitis}
                onChange={(e) => setBaslangic(e.target.value)}
                className="input-field text-xs px-3 py-2"
              />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>–</span>
              <input
                type="date"
                value={bitis}
                min={baslangic}
                max={today}
                onChange={(e) => setBitis(e.target.value)}
                className="input-field text-xs px-3 py-2"
              />
              <button
                onClick={fetchRapor}
                className="btn-primary text-xs px-4 py-2"
              >
                Getir
              </button>
            </div>
          )}
        </div>
      </div>

      {loading && !rapor ? (
        <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>Yükleniyor...</div>
      ) : rapor && (
        <>
          {/* Özet kartlar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Sipariş Geliri",    value: fmt(rapor.toplamGelir),    icon: TrendingUp,  color: "#22C55E", bg: "#22C55E15" },
              { label: "Kasa Tahsilatı",    value: fmt(rapor.kasaGelir),      icon: Wallet,      color: "#1A73E8", bg: "#1A73E815" },
              { label: "Sipariş Adedi",     value: String(rapor.siparisAdedi), icon: ShoppingBag, color: "#F59E0B", bg: "#F59E0B15" },
              { label: "Ortalama Fatura",   value: fmt(rapor.ortalamaFatura), icon: Receipt,     color: "#8B5CF6", bg: "#8B5CF615" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                      <Icon size={18} style={{ color: s.color }} />
                    </div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                  </div>
                  <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
                </div>
              );
            })}
          </div>

          {/* Gelir trendi */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 size={16} style={{ color: "#1A73E8" }} />
              <h2 className="font-semibold" style={{ color: "var(--text)" }}>Gelir Trendi</h2>
            </div>
            {rapor.gunlukTrend.length === 0 ? (
              <p className="text-center py-10 text-sm" style={{ color: "var(--text-muted)" }}>Bu dönemde teslim edilmiş sipariş yok</p>
            ) : (
              <div className="flex items-end gap-1.5 h-40">
                {rapor.gunlukTrend.map((g) => {
                  const oran = (g.gelir / maxGelir) * 100;
                  return (
                    <div key={g.tarih} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="relative w-full flex flex-col justify-end" style={{ height: "120px" }}>
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10
                          px-2 py-1 rounded-lg text-xs whitespace-nowrap"
                          style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}>
                          {fmt(g.gelir)} · {g.adet} sipariş
                        </div>
                        <div
                          className="w-full rounded-t-md transition-all"
                          style={{ height: `${Math.max(oran, 2)}%`, backgroundColor: "#1A73E8", opacity: 0.85 }}
                        />
                      </div>
                      <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>{tarihLabel(g.tarih)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ödeme yöntemi dağılımı */}
          <div className="card p-5">
            <h2 className="font-semibold mb-4" style={{ color: "var(--text)" }}>Ödeme Yöntemi Dağılımı</h2>
            {rapor.odemeDagilimi.length === 0 ? (
              <p className="text-center py-6 text-sm" style={{ color: "var(--text-muted)" }}>Bu dönemde ödeme kaydı yok</p>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {["nakit", "kart", "havale"].map((yontem) => {
                  const cfg = ODEME_CONFIG[yontem];
                  const Icon = cfg.icon;
                  const data = rapor.odemeDagilimi.find((o) => o.yontem === yontem);
                  return (
                    <div key={yontem} className="p-4 rounded-xl text-center"
                      style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.color}30` }}>
                      <Icon size={22} className="mx-auto mb-2" style={{ color: cfg.color }} />
                      <p className="text-lg font-bold" style={{ color: cfg.color }}>
                        {data ? fmt(data.tutar) : "₺0"}
                      </p>
                      <p className="text-xs font-semibold mt-0.5" style={{ color: cfg.color }}>{cfg.label}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                        {data ? `${data.adet} işlem` : "işlem yok"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Alt iki panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* En çok satılan ürünler */}
            <div className="card p-5">
              <h2 className="font-semibold mb-4" style={{ color: "var(--text)" }}>En Çok Satılan Ürünler</h2>
              {rapor.populerUrunler.length === 0 ? (
                <p className="text-center py-8 text-sm" style={{ color: "var(--text-muted)" }}>Veri yok</p>
              ) : (
                <div className="space-y-4">
                  {rapor.populerUrunler.map((u, i) => {
                    const color = URUN_COLORS[i] ?? "#1A73E8";
                    const oran = Math.round((u.adet / maxUrun) * 100);
                    return (
                      <div key={u.name}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                              style={{ backgroundColor: `${color}20`, color }}>
                              {i + 1}
                            </span>
                            <span className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{u.name}</span>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <span className="text-sm font-bold" style={{ color }}>{u.adet} adet</span>
                            <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>{fmt(u.gelir)}</span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${oran}%`, backgroundColor: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Masa başı gelir */}
            <div className="card p-5">
              <h2 className="font-semibold mb-4" style={{ color: "var(--text)" }}>Masa Bazlı Gelir</h2>
              {rapor.masaBaziGelir.length === 0 ? (
                <p className="text-center py-8 text-sm" style={{ color: "var(--text-muted)" }}>Veri yok</p>
              ) : (
                <div className="space-y-2">
                  {rapor.masaBaziGelir.map((m) => {
                    const oran = Math.round((m.gelir / maxMasa) * 100);
                    return (
                      <div key={m.no} className="p-3 rounded-xl" style={{ backgroundColor: "var(--bg)" }}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold" style={{ color: "#1A73E8" }}>Masa {m.no}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded-full"
                              style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)" }}>
                              {m.alan}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold" style={{ color: "var(--text)" }}>{fmt(m.gelir)}</span>
                            <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>
                              ort. {fmt(m.ortalama)}
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-card)" }}>
                          <div className="h-full rounded-full" style={{ width: `${oran}%`, backgroundColor: "#1A73E8", opacity: 0.7 }} />
                        </div>
                        <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                          {m.siparisSayisi} sipariş
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
