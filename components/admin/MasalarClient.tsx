"use client";
import { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";

type Talep = { id: number; tip: string; durum: string; createdAt: string };
type Masa = { id: number; no: number; kapasite: number; aktif: boolean; talepler: Talep[] };

export default function MasalarClient() {
  const [masalar, setMasalar] = useState<Masa[]>([]);
  const [no, setNo] = useState("");
  const [kapasite, setKapasite] = useState("4");
  const [loading, setLoading] = useState(false);
  const [qrMap, setQrMap] = useState<Record<number, string>>({});
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const fetchMasalar = useCallback(async () => {
    const res = await fetch("/api/admin/masalar");
    const data = await res.json();
    setMasalar(data);

    // QR üret
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
    // 10 saniyede bir yenile — canlı talep takibi
    const interval = setInterval(fetchMasalar, 10000);
    return () => clearInterval(interval);
  }, [fetchMasalar]);

  const addMasa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/masalar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ no: Number(no), kapasite: Number(kapasite) }),
    });
    setNo(""); setLoading(false);
    fetchMasalar();
  };

  const deleteMasa = async (id: number) => {
    if (!confirm("Bu masayı silmek istiyor musunuz?")) return;
    await fetch(`/api/admin/masalar/${id}`, { method: "DELETE" });
    fetchMasalar();
  };

  const tamamla = async (talepId: number) => {
    await fetch(`/api/admin/talep/${talepId}`, { method: "PATCH" });
    fetchMasalar();
  };

  const printQR = (masaNo: number, qr: string) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Masa ${masaNo} QR</title>
      <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;gap:16px;}
      h2{font-size:24px;margin:0;}p{color:#666;margin:0;font-size:14px;}</style></head>
      <body>
        <img src="${qr}" width="200" height="200" />
        <h2>Masa ${masaNo}</h2>
        <p>Menü ve garson çağırma için QR'ı okutun</p>
        <script>window.print();<\/script>
      </body></html>
    `);
  };

  const bekleyenTalepler = masalar.flatMap((m) =>
    m.talepler.filter((t) => t.durum === "bekliyor").map((t) => ({ ...t, masaNo: m.no }))
  );

  const inputCls = "bg-[#0F0F0F] border border-[#2A2A2A] text-white px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* Sol: Masa ekle + Aktif talepler */}
      <div className="space-y-6">
        {/* Masa ekle */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6">
          <h2 className="text-[#C9A84C] uppercase tracking-wider text-sm font-semibold mb-4">Masa Ekle</h2>
          <form onSubmit={addMasa} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Masa No *</label>
              <input value={no} onChange={(e) => setNo(e.target.value)} required type="number" min="1" className={`${inputCls} w-full`} placeholder="5" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Kapasite</label>
              <select value={kapasite} onChange={(e) => setKapasite(e.target.value)} className={`${inputCls} w-full`}>
                {[2, 4, 6, 8, 10].map((n) => <option key={n}>{n}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full text-xs tracking-widest uppercase">
              {loading ? "Ekleniyor..." : "Ekle"}
            </button>
          </form>
        </div>

        {/* Aktif talepler */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#C9A84C] uppercase tracking-wider text-sm font-semibold">Bekleyen Talepler</h2>
            {bekleyenTalepler.length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {bekleyenTalepler.length}
              </span>
            )}
          </div>
          {bekleyenTalepler.length === 0 ? (
            <p className="text-gray-600 text-sm">Bekleyen talep yok.</p>
          ) : (
            <div className="space-y-3">
              {bekleyenTalepler.map((t) => (
                <div key={t.id} className={`flex items-center justify-between p-3 border ${t.tip === "hesap" ? "border-yellow-700 bg-yellow-900/10" : "border-blue-700 bg-blue-900/10"}`}>
                  <div>
                    <p className="font-semibold text-sm">
                      {t.tip === "garson" ? "🙋 Garson" : "🧾 Hesap"} — Masa {t.masaNo}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(t.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <button
                    onClick={() => tamamla(t.id)}
                    className="px-3 py-1 bg-green-800 hover:bg-green-700 text-white text-xs font-semibold transition-colors"
                  >
                    Tamam
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sağ: Masa listesi + QR */}
      <div className="lg:col-span-2">
        {masalar.length === 0 ? (
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-10 text-center text-gray-500">
            Henüz masa eklenmedi.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {masalar.map((masa) => {
              const bekleyen = masa.talepler.filter((t) => t.durum === "bekliyor");
              return (
                <div key={masa.id} className={`bg-[#1A1A1A] border p-5 text-center relative ${bekleyen.length > 0 ? "border-[#C9A84C]" : "border-[#2A2A2A]"}`}>
                  {bekleyen.length > 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {bekleyen.length}
                    </span>
                  )}
                  <p className="text-2xl font-bold text-[#C9A84C] mb-1">{masa.no}</p>
                  <p className="text-gray-500 text-xs mb-3">{masa.kapasite} kişilik</p>

                  {qrMap[masa.id] ? (
                    <img src={qrMap[masa.id]} alt={`Masa ${masa.no} QR`} className="mx-auto mb-3 w-24 h-24" />
                  ) : (
                    <div className="w-24 h-24 bg-[#0F0F0F] mx-auto mb-3 flex items-center justify-center">
                      <span className="text-gray-600 text-xs">QR...</span>
                    </div>
                  )}

                  <div className="flex gap-2 justify-center">
                    {qrMap[masa.id] && (
                      <button
                        onClick={() => printQR(masa.no, qrMap[masa.id])}
                        className="text-xs text-[#C9A84C] hover:text-white transition-colors border border-[#C9A84C] px-2 py-1"
                      >
                        Yazdır
                      </button>
                    )}
                    <button
                      onClick={() => deleteMasa(masa.id)}
                      className="text-xs text-gray-600 hover:text-red-400 transition-colors"
                    >
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
