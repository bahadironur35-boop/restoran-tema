"use client";
import { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";

type Talep = { id: number; tip: string; durum: string; createdAt: string };
type Masa = { id: number; no: number; kapasite: number; alan: string; durum: string; aktif: boolean; talepler: Talep[] };

const ALANLAR = ["Salon", "Bahçe", "Teras", "VIP", "Bar"];

const DURUM_CONFIG: Record<string, { label: string; color: string; bg: string; next: string }> = {
  bos:           { label: "Boş",           color: "#16A34A", bg: "#16A34A18", next: "dolu" },
  dolu:          { label: "Dolu",          color: "#EF4444", bg: "#EF444418", next: "temizleniyor" },
  temizleniyor:  { label: "Temizleniyor",  color: "#8B5CF6", bg: "#8B5CF618", next: "bos" },
  rezerveli:     { label: "Rezerveli",     color: "#F59E0B", bg: "#F59E0B18", next: "bos" },
};

export default function MasalarClient() {
  const [masalar, setMasalar] = useState<Masa[]>([]);
  const [no, setNo] = useState("");
  const [kapasite, setKapasite] = useState("4");
  const [alan, setAlan] = useState("Salon");
  const [loading, setLoading] = useState(false);
  const [qrMap, setQrMap] = useState<Record<number, string>>({});
  const [baseUrl, setBaseUrl] = useState("");
  const [aktifAlan, setAktifAlan] = useState<string>("Tümü");

  useEffect(() => { setBaseUrl(window.location.origin); }, []);

  const fetchMasalar = useCallback(async () => {
    const res = await fetch("/api/admin/masalar");
    const data: Masa[] = await res.json();
    setMasalar(data);
    if (baseUrl) {
      const map: Record<number, string> = {};
      for (const masa of data) {
        map[masa.id] = await QRCode.toDataURL(`${baseUrl}/masa/${masa.id}`, {
          width: 200, margin: 1, color: { dark: "#000000", light: "#FFFFFF" },
        });
      }
      setQrMap(map);
    }
  }, [baseUrl]);

  useEffect(() => {
    fetchMasalar();
    const interval = setInterval(fetchMasalar, 10000);
    return () => clearInterval(interval);
  }, [fetchMasalar]);

  const addMasa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/masalar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ no: Number(no), kapasite: Number(kapasite), alan }),
    });
    setNo(""); setLoading(false);
    fetchMasalar();
  };

  const deleteMasa = async (id: number) => {
    if (!confirm("Bu masayı silmek istiyor musunuz?")) return;
    await fetch(`/api/admin/masalar/${id}`, { method: "DELETE" });
    fetchMasalar();
  };

  const toggleDurum = async (masa: Masa) => {
    const nextDurum = DURUM_CONFIG[masa.durum]?.next ?? "bos";
    await fetch(`/api/admin/masalar/${masa.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durum: nextDurum }),
    });
    fetchMasalar();
  };

  const tamamla = async (talepId: number) => {
    await fetch(`/api/admin/talep/${talepId}`, { method: "PATCH" });
    fetchMasalar();
  };

  const printQR = (masa: Masa, qr: string) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Masa ${masa.no} QR</title>
      <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;gap:12px;}
      h2{font-size:24px;margin:0;}p{color:#666;margin:0;font-size:13px;}</style></head>
      <body>
        <img src="${qr}" width="200" height="200" />
        <h2>Masa ${masa.no}</h2>
        <p>${masa.alan}</p>
        <p>Menü ve garson çağırma için QR okutun</p>
        <script>window.print();<\/script>
      </body></html>
    `);
  };

  const bekleyenTalepler = masalar.flatMap((m) =>
    m.talepler.filter((t) => t.durum === "bekliyor").map((t) => ({ ...t, masaNo: m.no, masaAlan: m.alan }))
  );

  // Alana göre grupla
  const mevcutAlanlar = Array.from(new Set(masalar.map((m) => m.alan))).sort();
  const filtreliMasalar = aktifAlan === "Tümü" ? masalar : masalar.filter((m) => m.alan === aktifAlan);

  // Özet istatistikler
  const toplamMasa      = masalar.length;
  const doluMasa        = masalar.filter((m) => m.durum === "dolu").length;
  const rezerveliMasa   = masalar.filter((m) => m.durum === "rezerveli").length;
  const temizleniyorMasa = masalar.filter((m) => m.durum === "temizleniyor").length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* Sol panel */}
      <div className="space-y-6">

        {/* İstatistik özeti */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Toplam",     value: toplamMasa,       color: "var(--text)" },
            { label: "Dolu",       value: doluMasa,         color: "#EF4444" },
            { label: "Rezerve",    value: rezerveliMasa,    color: "#F59E0B" },
            { label: "Temizlik",   value: temizleniyorMasa, color: "#8B5CF6" },
          ].map((s) => (
            <div key={s.label} className="card p-3 text-center">
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Masa ekle */}
        <div className="card p-6">
          <h2 className="uppercase tracking-wider text-xs font-semibold mb-4" style={{ color: "var(--text)" }}>Masa Ekle</h2>
          <form onSubmit={addMasa} className="space-y-3">
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Masa No *</label>
              <input value={no} onChange={(e) => setNo(e.target.value)} required type="number" min="1"
                className="input-field w-full" placeholder="5" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Alan</label>
              <select value={alan} onChange={(e) => setAlan(e.target.value)} className="input-field w-full">
                {ALANLAR.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Kapasite</label>
              <select value={kapasite} onChange={(e) => setKapasite(e.target.value)} className="input-field w-full">
                {[2, 4, 6, 8, 10].map((n) => <option key={n}>{n}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full text-xs tracking-widest uppercase">
              {loading ? "Ekleniyor..." : "Ekle"}
            </button>
          </form>
        </div>

        {/* Bekleyen talepler */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="uppercase tracking-wider text-xs font-semibold" style={{ color: "var(--text)" }}>Bekleyen Talepler</h2>
            {bekleyenTalepler.length > 0 && (
              <span className="text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: "#EF4444" }}>
                {bekleyenTalepler.length}
              </span>
            )}
          </div>
          {bekleyenTalepler.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Bekleyen talep yok.</p>
          ) : (
            <div className="space-y-3">
              {bekleyenTalepler.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg" style={{
                  backgroundColor: t.tip === "hesap" ? "#F59E0B10" : "#1A73E810",
                  border: `1px solid ${t.tip === "hesap" ? "#F59E0B" : "#1A73E8"}`,
                }}>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                      {t.tip === "garson" ? "🔔 Garson" : "💳 Hesap"} – Masa {t.masaNo}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {t.masaAlan} · {new Date(t.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <button onClick={() => tamamla(t.id)}
                    className="px-3 py-1 text-white text-xs font-semibold rounded-lg"
                    style={{ backgroundColor: "#16A34A" }}>
                    Tamam
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sağ: Alan filtreleri + Masa grid */}
      <div className="lg:col-span-2 space-y-4">

        {/* Alan filtre tabları */}
        {mevcutAlanlar.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {["Tümü", ...mevcutAlanlar].map((a) => (
              <button
                key={a}
                onClick={() => setAktifAlan(a)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all"
                style={aktifAlan === a
                  ? { backgroundColor: "#1A73E8", color: "#fff" }
                  : { backgroundColor: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }
                }
              >
                {a}
                {a !== "Tümü" && (
                  <span className="ml-1.5 opacity-70">
                    {masalar.filter((m) => m.alan === a).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Masa grid */}
        {filtreliMasalar.length === 0 ? (
          <div className="card p-10 text-center" style={{ color: "var(--text-muted)" }}>
            Henüz masa eklenmedi.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filtreliMasalar.map((masa) => {
              const bekleyen = masa.talepler.filter((t) => t.durum === "bekliyor");
              const durumCfg = DURUM_CONFIG[masa.durum] ?? DURUM_CONFIG.bos;
              return (
                <div key={masa.id} className="card p-4 text-center relative"
                  style={bekleyen.length > 0 ? { borderColor: "#F59E0B" } : {}}>

                  {/* Talep badge */}
                  {bekleyen.length > 0 && (
                    <span className="absolute top-2 right-2 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "#EF4444" }}>
                      {bekleyen.length}
                    </span>
                  )}

                  {/* Alan etiketi */}
                  <span className="text-xs px-2 py-0.5 rounded-full mb-2 inline-block"
                    style={{ backgroundColor: "var(--bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                    {masa.alan}
                  </span>

                  <p className="text-2xl font-bold my-1" style={{ color: "#1A73E8" }}>{masa.no}</p>
                  <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>{masa.kapasite} kişilik</p>

                  {/* Durum toggle */}
                  <button
                    onClick={() => toggleDurum(masa)}
                    className="text-xs font-semibold px-3 py-1 rounded-full mb-3 transition-all"
                    style={{ backgroundColor: durumCfg.bg, color: durumCfg.color, border: `1px solid ${durumCfg.color}` }}
                  >
                    {durumCfg.label}
                  </button>

                  {/* QR */}
                  {qrMap[masa.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrMap[masa.id]} alt={`Masa ${masa.no} QR`} className="mx-auto mb-3 w-20 h-20" />
                  ) : (
                    <div className="w-20 h-20 mx-auto mb-3 flex items-center justify-center rounded-lg"
                      style={{ backgroundColor: "var(--bg)" }}>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>QR...</span>
                    </div>
                  )}

                  <div className="flex gap-2 justify-center">
                    {qrMap[masa.id] && (
                      <button onClick={() => printQR(masa, qrMap[masa.id])}
                        className="text-xs px-2 py-1 rounded-lg transition-colors"
                        style={{ border: "1px solid #1A73E8", color: "#1A73E8" }}>
                        Yazdır
                      </button>
                    )}
                    <button onClick={() => deleteMasa(masa.id)}
                      className="text-xs transition-colors hover:text-red-400"
                      style={{ color: "var(--text-muted)" }}>
                      Sil
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
