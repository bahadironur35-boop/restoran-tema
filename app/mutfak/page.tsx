"use client";
import { useState, useEffect, useCallback, useRef } from "react";

type SiparisItem = { id: number; name: string; adet: number; not: string | null };
type Siparis = {
  id: number;
  durum: string;
  notlar: string | null;
  createdAt: string;
  masa: { no: number };
  items: SiparisItem[];
};

const durumRenk: Record<string, string> = {
  bekliyor: "border-yellow-600 bg-yellow-900/10",
  hazirlaniyor: "border-blue-600 bg-blue-900/10",
};

function gecikmeVar(date: string, dakika = 15) {
  return (Date.now() - new Date(date).getTime()) > dakika * 60 * 1000;
}

const durumLabel: Record<string, string> = {
  bekliyor: "Bekliyor",
  hazirlaniyor: "Hazırlanıyor",
};

function elapsed(date: string) {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (secs < 60) return `${secs}sn`;
  return `${Math.floor(secs / 60)}dk`;
}

export default function MutfakPage() {
  const [siparisler, setSiparisler] = useState<Siparis[]>([]);
  const [tick, setTick] = useState(0);
  const oncekiAdet = useRef(0);
  const [kdsAktif, setKdsAktif] = useState<boolean | null>(null);
  const [restaurantName, setRestaurantName] = useState("Mutfak");

  useEffect(() => {
    fetch("/api/admin/ayarlar").then((r) => r.json()).then((data) => {
      setKdsAktif(data.kdsAktif !== "false");
      if (data.restaurantName) setRestaurantName(data.restaurantName);
    });
  }, []);

  const beep = () => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch {}
  };

  const fetchSiparisler = useCallback(async () => {
    const res = await fetch("/api/mutfak");
    const data = await res.json();
    setSiparisler((prev) => {
      const yeniAdet = data.filter((s: Siparis) => s.durum === "bekliyor").length;
      const eskiAdet = prev.filter((s) => s.durum === "bekliyor").length;
      if (yeniAdet > eskiAdet) beep();
      oncekiAdet.current = yeniAdet;
      return data;
    });
  }, []);

  useEffect(() => {
    fetchSiparisler();
    const interval = setInterval(fetchSiparisler, 8000);
    return () => clearInterval(interval);
  }, [fetchSiparisler]);

  // Süre sayacı
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 10000);
    return () => clearInterval(t);
  }, []);

  const updateDurum = async (id: number, durum: string) => {
    await fetch("/api/mutfak", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, durum }),
    });
    fetchSiparisler();
  };

  const bekleyenler = siparisler.filter((s) => s.durum === "bekliyor");
  const hazirlananlar = siparisler.filter((s) => s.durum === "hazirlaniyor");

  if (kdsAktif === null) return null;
  if (!kdsAktif) return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-500">KDS Devre Dışı</p>
        <p className="text-gray-600 mt-2 text-sm">Ayarlar &gt; Sistem Özellikleri &gt; KDS (Mutfak Ekranı)</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#C9A84C] tracking-widest uppercase">{restaurantName} — Mutfak</h1>
          <p className="text-gray-500 text-sm">8 saniyede bir güncelleniyor</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-mono text-white">{new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</p>
          <p className="text-gray-500 text-sm">{bekleyenler.length} bekliyor · {hazirlananlar.length} hazırlanıyor</p>
        </div>
      </div>

      {siparisler.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600 text-xl">Bekleyen sipariş yok 🍳</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {siparisler.map((s) => {
            const gecikti = gecikmeVar(s.createdAt);
            const kartClass = gecikti
              ? "border-red-500 bg-red-900/20"
              : durumRenk[s.durum];
            return (
            <div key={s.id} className={`border-2 p-5 ${kartClass}`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold">Masa {s.masa.no}</p>
                    {gecikti && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                        GECİKİYOR
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">
                    <span className={`font-semibold ${gecikti ? "text-red-400" : s.durum === "bekliyor" ? "text-yellow-400" : "text-blue-400"}`}>
                      {durumLabel[s.durum]}
                    </span>
                    {" · "}{elapsed(s.createdAt)} önce
                  </p>
                </div>
                <span className="text-2xl font-mono text-gray-500">#{s.id}</span>
              </div>

              {/* Items */}
              <div className="space-y-2 mb-4">
                {s.items.map((item) => (
                  <div key={item.id} className="flex items-baseline gap-3">
                    <span className="text-[#C9A84C] font-bold text-xl w-8">{item.adet}×</span>
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      {item.not && <p className="text-yellow-300 text-xs">⚠ {item.not}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {s.notlar && (
                <p className="text-yellow-300 text-sm border border-yellow-800 bg-yellow-900/20 px-3 py-2 mb-4">
                  📝 {s.notlar}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {s.durum === "bekliyor" && (
                  <button
                    onClick={() => updateDurum(s.id, "hazirlaniyor")}
                    className="flex-1 bg-blue-700 hover:bg-blue-600 text-white py-3 font-bold uppercase tracking-wider text-sm transition-colors"
                  >
                    Başla
                  </button>
                )}
                {s.durum === "hazirlaniyor" && (
                  <button
                    onClick={() => updateDurum(s.id, "hazir")}
                    className="flex-1 bg-green-700 hover:bg-green-600 text-white py-3 font-bold uppercase tracking-wider text-sm transition-colors"
                  >
                    Hazır ✓
                  </button>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
