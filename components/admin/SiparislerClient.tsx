"use client";
import { useState, useEffect, useCallback } from "react";
import { useSSE } from "@/lib/useSSE";

type SiparisItem = { id: number; name: string; adet: number; not: string | null };
type Siparis = {
  id: number;
  masaId: number;
  durum: string;
  notlar: string | null;
  createdAt: string;
  masa: { no: number };
  items: SiparisItem[];
};

const durumRenk: Record<string, string> = {
  bekliyor: "border-yellow-500",
  hazirlaniyor: "border-blue-500",
  hazir: "border-green-500",
};

const durumLabel: Record<string, { label: string; color: string; bg: string }> = {
  bekliyor:     { label: "Bekliyor",              color: "#F59E0B", bg: "#F59E0B15" },
  hazirlaniyor: { label: "Hazırlanıyor",          color: "#3B82F6", bg: "#3B82F615" },
  hazir:        { label: "Hazır – Servis Bekliyor", color: "#22C55E", bg: "#22C55E15" },
  teslim:       { label: "Teslim Edildi",         color: "#64748B", bg: "#64748B15" },
};

function saat(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function parsePrice(p: string) {
  return parseFloat(p.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
}

const today = new Date().toISOString().split("T")[0];

export default function SiparislerClient() {
  const [siparisler, setSiparisler] = useState<Siparis[]>([]);
  const [filter, setFilter]         = useState("hepsi");
  const [mod, setMod]               = useState<"aktif" | "gecmis">("aktif");
  const [tarih, setTarih]           = useState(today);
  const [yukleniyor, setYukleniyor] = useState(false);

  const fetchAktif = useCallback(async () => {
    const res = await fetch("/api/admin/siparis");
    setSiparisler(await res.json());
  }, []);

  const fetchGecmis = useCallback(async () => {
    setYukleniyor(true);
    const res = await fetch(`/api/admin/siparis?gecmis=true&tarih=${tarih}`);
    setSiparisler(await res.json());
    setYukleniyor(false);
  }, [tarih]);

  useEffect(() => {
    if (mod === "aktif") fetchAktif();
    else fetchGecmis();
  }, [mod, fetchAktif, fetchGecmis]);

  // SSE: aktif modda anlık güncelleme
  useSSE("/api/events?scope=siparisler", (event, data) => {
    if (event !== "update" || mod !== "aktif") return;
    const { siparisler: yeni } = data as { siparisler: Siparis[] };
    if (yeni) setSiparisler(yeni);
  });

  const updateDurum = async (siparis: Siparis, durum: string) => {
    await fetch(`/api/admin/siparis/${siparis.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durum }),
    });
    if (durum === "teslim") {
      const digerAktif = siparisler.filter(
        (s) => s.masaId === siparis.masaId && s.id !== siparis.id && s.durum !== "teslim"
      );
      if (digerAktif.length === 0) {
        await fetch(`/api/admin/masalar/${siparis.masaId}/kapat`, { method: "POST" });
      }
    }
    fetchAktif();
  };

  const hazirCount = siparisler.filter((s) => s.durum === "hazir").length;
  const filtered   = mod === "gecmis"
    ? siparisler
    : filter === "hepsi" ? siparisler : siparisler.filter((s) => s.durum === filter);

  const gecmisToplam = mod === "gecmis"
    ? siparisler.reduce((sum, s) => sum + s.items.reduce((a, i) => {
        const p = (i as unknown as { price?: string }).price;
        return a + (p ? parsePrice(p) * i.adet : 0);
      }, 0), 0)
    : 0;

  return (
    <div>
      {/* Mod seçici */}
      <div className="flex gap-2 mb-4">
        {[
          { key: "aktif",  label: "Aktif Siparişler" },
          { key: "gecmis", label: "Geçmiş" },
        ].map((m) => (
          <button key={m.key} onClick={() => { setMod(m.key as "aktif" | "gecmis"); setFilter("hepsi"); }}
            className="px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-lg transition-all"
            style={mod === m.key
              ? { backgroundColor: "#1A73E8", color: "#fff" }
              : { backgroundColor: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Aktif filtreler */}
      {mod === "aktif" && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: "hepsi",       label: "Hepsi" },
            { key: "bekliyor",    label: "Bekliyor" },
            { key: "hazirlaniyor",label: "Hazırlanıyor" },
            { key: "hazir",       label: `Hazır${hazirCount > 0 ? ` (${hazirCount})` : ""}` },
          ].map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className="px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-colors rounded-lg"
              style={filter === f.key
                ? { backgroundColor: "#0F172A", color: "#fff", border: "1px solid #334155" }
                : { backgroundColor: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Geçmiş tarih seçici */}
      {mod === "gecmis" && (
        <div className="flex items-center gap-3 mb-6">
          <input type="date" value={tarih} max={today}
            onChange={(e) => setTarih(e.target.value)}
            className="input-field text-sm px-3 py-2" />
          <button onClick={fetchGecmis} className="btn-primary text-xs px-4 py-2">Getir</button>
          {siparisler.length > 0 && (
            <div className="ml-auto flex gap-4 text-sm">
              <span style={{ color: "var(--text-muted)" }}>{siparisler.length} sipariş</span>
              <span className="font-bold" style={{ color: "#22C55E" }}>
                ₺{gecmisToplam.toLocaleString("tr-TR", { minimumFractionDigits: 0 })}
              </span>
            </div>
          )}
        </div>
      )}

      {yukleniyor ? (
        <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>Yükleniyor...</div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center" style={{ color: "var(--text-muted)" }}>
          {mod === "gecmis" ? "Bu tarihte teslim edilmiş sipariş yok." : "Bu kategoride sipariş yok."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s) => {
            const info = durumLabel[s.durum] ?? durumLabel.bekliyor;
            const borderCls = mod === "gecmis" ? "border-slate-700" : (durumRenk[s.durum] ?? "");
            return (
              <div key={s.id} className={`card border-2 p-5 ${borderCls}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xl font-bold" style={{ color: "var(--text)" }}>{s.masa ? `Masa ${s.masa.no}` : "Paket"}</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: info.bg, color: info.color }}>
                      {info.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>#{s.id}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{saat(s.createdAt)}</p>
                  </div>
                </div>

                <div className="space-y-1 mb-3">
                  {s.items.map((item) => (
                    <div key={item.id} className="flex gap-2 text-sm">
                      <span className="font-bold" style={{ color: "var(--gold)" }}>{item.adet}×</span>
                      <span style={{ color: "var(--text)" }}>{item.name}</span>
                      {item.not && <span className="text-xs" style={{ color: "#F59E0B" }}>({item.not})</span>}
                    </div>
                  ))}
                </div>

                {s.notlar && (
                  <p className="text-xs px-2 py-1 mb-3 rounded-lg"
                    style={{ backgroundColor: "#F59E0B15", color: "#F59E0B", border: "1px solid #F59E0B30" }}>
                    📝 {s.notlar}
                  </p>
                )}

                {mod === "aktif" && (
                  <div className="flex gap-2">
                    {s.durum === "hazir" && (
                      <button onClick={() => updateDurum(s, "teslim")}
                        className="flex-1 py-2.5 font-bold uppercase tracking-wider text-xs rounded-lg text-white"
                        style={{ backgroundColor: "#16A34A" }}>
                        Teslim Edildi ✓
                      </button>
                    )}
                    {s.durum === "bekliyor" && (
                      <button onClick={() => updateDurum(s, "hazirlaniyor")}
                        className="flex-1 py-2.5 font-bold uppercase tracking-wider text-xs rounded-lg text-white"
                        style={{ backgroundColor: "#1A73E8" }}>
                        Hazırlanıyor
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
