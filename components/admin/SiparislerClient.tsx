"use client";
import { useState, useEffect, useCallback } from "react";

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
  bekliyor: "border-yellow-700",
  hazirlaniyor: "border-blue-700",
  hazir: "border-green-500",
};

const durumLabel: Record<string, { label: string; color: string }> = {
  bekliyor: { label: "Bekliyor", color: "text-yellow-400" },
  hazirlaniyor: { label: "Hazırlanıyor", color: "text-blue-400" },
  hazir: { label: "Hazır — Servis Bekliyor", color: "text-green-400" },
};

export default function SiparislerClient() {
  const [siparisler, setSiparisler] = useState<Siparis[]>([]);
  const [filter, setFilter] = useState("hepsi");

  const fetchSiparisler = useCallback(async () => {
    const res = await fetch("/api/admin/siparis");
    setSiparisler(await res.json());
  }, []);

  useEffect(() => {
    fetchSiparisler();
    const interval = setInterval(fetchSiparisler, 8000);
    return () => clearInterval(interval);
  }, [fetchSiparisler]);

  const updateDurum = async (id: number, durum: string) => {
    await fetch(`/api/admin/siparis/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durum }),
    });
    fetchSiparisler();
  };

  const hazirCount = siparisler.filter((s) => s.durum === "hazir").length;

  const filtered = filter === "hepsi" ? siparisler : siparisler.filter((s) => s.durum === filter);

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: "hepsi", label: "Hepsi" },
          { key: "bekliyor", label: "Bekliyor" },
          { key: "hazirlaniyor", label: "Hazırlanıyor" },
          { key: "hazir", label: `Hazır${hazirCount > 0 ? ` (${hazirCount})` : ""}` },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-colors ${filter === f.key ? "bg-[#C9A84C] text-black" : "bg-[#1A1A1A] text-gray-400 border border-[#2A2A2A] hover:text-white"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-10 text-center text-gray-500">
          Bu kategoride sipariş yok.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <div key={s.id} className={`bg-[#1A1A1A] border-2 p-5 ${durumRenk[s.durum]}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xl font-bold">Masa {s.masa.no}</p>
                  <p className={`text-sm font-semibold ${durumLabel[s.durum].color}`}>
                    {durumLabel[s.durum].label}
                  </p>
                </div>
                <span className="text-gray-600 text-sm">#{s.id}</span>
              </div>

              <div className="space-y-1 mb-3">
                {s.items.map((item) => (
                  <div key={item.id} className="flex gap-2 text-sm">
                    <span className="text-[#C9A84C] font-bold">{item.adet}×</span>
                    <span>{item.name}</span>
                    {item.not && <span className="text-yellow-400 text-xs">({item.not})</span>}
                  </div>
                ))}
              </div>

              {s.notlar && (
                <p className="text-yellow-300 text-xs border border-yellow-800 px-2 py-1 mb-3">📝 {s.notlar}</p>
              )}

              <div className="flex gap-2">
                {s.durum === "hazir" && (
                  <button
                    onClick={() => updateDurum(s.id, "teslim")}
                    className="flex-1 bg-green-700 hover:bg-green-600 text-white py-2.5 font-bold uppercase tracking-wider text-xs transition-colors"
                  >
                    Teslim Edildi ✓
                  </button>
                )}
                {s.durum === "bekliyor" && (
                  <button
                    onClick={() => updateDurum(s.id, "hazirlaniyor")}
                    className="flex-1 bg-blue-800 hover:bg-blue-700 text-white py-2.5 font-bold uppercase tracking-wider text-xs transition-colors"
                  >
                    Hazırlanıyor
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
