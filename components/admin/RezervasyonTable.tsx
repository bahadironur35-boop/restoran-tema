"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { List, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

type Rezervasyon = {
  id: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  notes: string | null;
  status: string;
  masaId: number | null;
  masa: { no: number; alan: string } | null;
  createdAt: Date;
};

type Masa = { id: number; no: number; alan: string; kapasite: number; durum: string };

const statusLabel: Record<string, string> = {
  bekliyor:   "Bekliyor",
  onaylandi:  "Onaylandı",
  reddedildi: "Reddedildi",
};

const statusClass: Record<string, string> = {
  bekliyor:   "badge badge-yellow",
  onaylandi:  "badge badge-green",
  reddedildi: "badge badge-red",
};

const statusDot: Record<string, string> = {
  bekliyor:   "#F59E0B",
  onaylandi:  "#22C55E",
  reddedildi: "#EF4444",
};

const GUNLER = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function haftaninGunleri(referans: Date): Date[] {
  const gun = referans.getDay(); // 0=Pazar
  const pazartesi = new Date(referans);
  pazartesi.setDate(referans.getDate() - ((gun + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(pazartesi);
    d.setDate(pazartesi.getDate() + i);
    return d;
  });
}

function isoTarih(d: Date) {
  return d.toISOString().split("T")[0];
}

function formatGun(d: Date) {
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
}

export default function RezervasyonTable({
  rezervasyonlar,
  masalar,
}: {
  rezervasyonlar: Rezervasyon[];
  masalar: Masa[];
}) {
  const [mod, setMod] = useState<"liste" | "takvim">("liste");
  const [filter, setFilter] = useState("hepsi");
  const [loading, setLoading] = useState<number | null>(null);
  const [onayModal, setOnayModal] = useState<Rezervasyon | null>(null);
  const [seciliMasaId, setSeciliMasaId] = useState<string>("");
  const [haftaRef, setHaftaRef] = useState(new Date());
  const [detayModal, setDetayModal] = useState<Rezervasyon | null>(null);
  const router = useRouter();

  const gunler = haftaninGunleri(haftaRef);
  const bugun = isoTarih(new Date());

  const filtered = filter === "hepsi"
    ? rezervasyonlar
    : rezervasyonlar.filter((r) => r.status === filter);

  const updateStatus = async (id: number, status: string, masaId?: number | null) => {
    setLoading(id);
    await fetch(`/api/admin/rezervasyon/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...(masaId !== undefined ? { masaId } : {}) }),
    });
    setLoading(null);
    setOnayModal(null);
    setDetayModal(null);
    router.refresh();
  };

  const deleteRez = async (id: number) => {
    if (!confirm("Bu rezervasyonu silmek istediğinizden emin misiniz?")) return;
    setLoading(id);
    await fetch(`/api/admin/rezervasyon/${id}`, { method: "DELETE" });
    setLoading(null);
    setDetayModal(null);
    router.refresh();
  };

  const bosVeyaRezerveMasalar = masalar.filter(
    (m) => m.durum === "bos" || m.durum === "rezerveli"
  );

  const handleOnayla = (r: Rezervasyon) => {
    setSeciliMasaId(r.masaId ? String(r.masaId) : "");
    setOnayModal(r);
    setDetayModal(null);
  };

  const confirmOnayla = () => {
    if (!onayModal) return;
    const masaId = seciliMasaId ? Number(seciliMasaId) : null;
    updateStatus(onayModal.id, "onaylandi", masaId);
  };

  return (
    <div>
      {/* Onay modal */}
      {onayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm space-y-4"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div>
              <h3 className="font-semibold text-base" style={{ color: "var(--text)" }}>
                Rezervasyonu Onayla
              </h3>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                {onayModal.name} · {onayModal.date} {onayModal.time} · {onayModal.guests} kişi
              </p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1.5"
                style={{ color: "var(--text-muted)" }}>
                Masa Ata (isteğe bağlı)
              </label>
              <select value={seciliMasaId} onChange={(e) => setSeciliMasaId(e.target.value)}
                className="input-field w-full">
                <option value="">— Masa seçme —</option>
                {bosVeyaRezerveMasalar.map((m) => (
                  <option key={m.id} value={m.id}>
                    Masa {m.no} · {m.alan} · {m.kapasite} kişilik
                    {m.durum === "rezerveli" ? " (Rezerveli)" : ""}
                  </option>
                ))}
              </select>
              {seciliMasaId && (
                <p className="text-xs mt-1.5" style={{ color: "#F59E0B" }}>
                  Bu masa rezervasyon onaylanınca "Rezerveli" olarak işaretlenecek.
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setOnayModal(null)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
                style={{ backgroundColor: "var(--bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                İptal
              </button>
              <button onClick={confirmOnayla} disabled={loading === onayModal.id}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white"
                style={{ backgroundColor: "#16A34A" }}>
                {loading === onayModal.id ? "..." : "Onayla"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detay modal (takvimden tıklanınca) */}
      {detayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm space-y-4"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-base" style={{ color: "var(--text)" }}>{detayModal.name}</h3>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{detayModal.phone} · {detayModal.email}</p>
              </div>
              <span className={statusClass[detayModal.status]}>{statusLabel[detayModal.status]}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Tarih", value: detayModal.date },
                { label: "Saat",  value: detayModal.time },
                { label: "Kişi",  value: `${detayModal.guests} kişi` },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-xl" style={{ backgroundColor: "var(--bg)" }}>
                  <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                  <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>{s.value}</p>
                </div>
              ))}
            </div>
            {detayModal.masa && (
              <p className="text-sm" style={{ color: "#1A73E8" }}>
                Masa {detayModal.masa.no} · {detayModal.masa.alan}
              </p>
            )}
            {detayModal.notes && (
              <p className="text-sm p-3 rounded-xl" style={{ backgroundColor: "#F59E0B15", color: "#F59E0B" }}>
                📝 {detayModal.notes}
              </p>
            )}
            <div className="flex gap-2 flex-wrap">
              {detayModal.status === "bekliyor" && (
                <>
                  <button onClick={() => handleOnayla(detayModal)}
                    className="flex-1 py-2 text-xs font-semibold rounded-lg text-white"
                    style={{ backgroundColor: "#16A34A" }}>
                    Onayla
                  </button>
                  <button onClick={() => updateStatus(detayModal.id, "reddedildi")}
                    disabled={loading === detayModal.id}
                    className="flex-1 py-2 text-xs font-semibold rounded-lg text-white"
                    style={{ backgroundColor: "#DC2626" }}>
                    Reddet
                  </button>
                </>
              )}
              {detayModal.status === "onaylandi" && !detayModal.masaId && (
                <button onClick={() => handleOnayla(detayModal)}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg"
                  style={{ color: "#1A73E8", border: "1px solid #1A73E8" }}>
                  Masa Ata
                </button>
              )}
              <button onClick={() => deleteRez(detayModal.id)}
                className="py-2 px-3 text-xs rounded-lg"
                style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                Sil
              </button>
              <button onClick={() => setDetayModal(null)}
                className="py-2 px-3 text-xs rounded-lg"
                style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Görünüm seçici */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", width: "fit-content" }}>
          {([["liste", List, "Liste"], ["takvim", CalendarDays, "Takvim"]] as const).map(([key, Icon, label]) => (
            <button key={key} onClick={() => setMod(key)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
              style={mod === key
                ? { backgroundColor: "#1A73E8", color: "#fff" }
                : { color: "var(--text-muted)" }}>
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* Filtre tabları (sadece listede) */}
        {mod === "liste" && (
          <div className="flex gap-2 flex-wrap">
            {["hepsi", "bekliyor", "onaylandi", "reddedildi"].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1.5 text-xs uppercase tracking-wider font-semibold transition-colors rounded-lg"
                style={filter === f
                  ? { backgroundColor: "#1A73E8", color: "#fff" }
                  : { backgroundColor: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }
                }>
                {f === "hepsi" ? "Hepsi" : statusLabel[f]}
              </button>
            ))}
          </div>
        )}

        {/* Hafta gezgini (sadece takvimde) */}
        {mod === "takvim" && (
          <div className="flex items-center gap-3">
            <button onClick={() => { const d = new Date(haftaRef); d.setDate(d.getDate() - 7); setHaftaRef(d); }}
              className="p-1.5 rounded-lg transition-colors"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              {formatGun(gunler[0])} – {formatGun(gunler[6])}
            </span>
            <button onClick={() => { const d = new Date(haftaRef); d.setDate(d.getDate() + 7); setHaftaRef(d); }}
              className="p-1.5 rounded-lg transition-colors"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              <ChevronRight size={16} />
            </button>
            <button onClick={() => setHaftaRef(new Date())}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              Bugün
            </button>
          </div>
        )}
      </div>

      {/* ── TAKVİM GÖRÜNÜMÜ ── */}
      {mod === "takvim" && (
        <div className="grid grid-cols-7 gap-2">
          {gunler.map((gun, gi) => {
            const iso = isoTarih(gun);
            const gunRez = rezervasyonlar.filter((r) => r.date === iso);
            const isToday = iso === bugun;
            return (
              <div key={iso} className="min-h-32 rounded-xl p-2 flex flex-col gap-1"
                style={{
                  backgroundColor: isToday ? "#1A73E808" : "var(--bg-card)",
                  border: `1px solid ${isToday ? "#1A73E8" : "var(--border)"}`,
                }}>
                {/* Gün başlığı */}
                <div className="text-center mb-1">
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{GUNLER[gi]}</p>
                  <p className="text-base font-bold" style={{ color: isToday ? "#1A73E8" : "var(--text)" }}>
                    {gun.getDate()}
                  </p>
                </div>
                {/* Rezervasyonlar */}
                {gunRez.length === 0 ? (
                  <p className="text-[10px] text-center mt-2" style={{ color: "var(--border)" }}>–</p>
                ) : (
                  gunRez
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((r) => (
                      <button key={r.id} onClick={() => setDetayModal(r)}
                        className="w-full text-left px-2 py-1 rounded-lg text-[10px] leading-tight transition-opacity hover:opacity-80"
                        style={{
                          backgroundColor: `${statusDot[r.status]}20`,
                          border: `1px solid ${statusDot[r.status]}40`,
                        }}>
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: statusDot[r.status] }} />
                          <span className="font-semibold" style={{ color: "var(--text)" }}>{r.time}</span>
                        </div>
                        <p className="truncate" style={{ color: "var(--text-muted)" }}>{r.name}</p>
                        <p style={{ color: "var(--text-muted)" }}>{r.guests} kişi</p>
                      </button>
                    ))
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── LİSTE GÖRÜNÜMÜ ── */}
      {mod === "liste" && (
        filtered.length === 0 ? (
          <div className="card p-10 text-center" style={{ color: "var(--text-muted)" }}>
            Bu kategoride rezervasyon yok.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <div key={r.id} className="card p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Misafir</p>
                      <p className="font-semibold" style={{ color: "var(--text)" }}>{r.name}</p>
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>{r.phone}</p>
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>{r.email}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Tarih / Saat</p>
                      <p className="font-semibold" style={{ color: "var(--text)" }}>{r.date}</p>
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>{r.time}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Kişi</p>
                      <p className="font-semibold" style={{ color: "var(--text)" }}>{r.guests} kişi</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Masa</p>
                      {r.masa ? (
                        <p className="font-semibold" style={{ color: "#1A73E8" }}>
                          Masa {r.masa.no}
                          <span className="text-xs font-normal ml-1" style={{ color: "var(--text-muted)" }}>
                            {r.masa.alan}
                          </span>
                        </p>
                      ) : (
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>–</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Notlar</p>
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>{r.notes || "–"}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span className={statusClass[r.status]}>{statusLabel[r.status]}</span>
                    {r.status === "bekliyor" && (
                      <div className="flex gap-2">
                        <button onClick={() => handleOnayla(r)} disabled={loading === r.id}
                          className="px-3 py-1.5 text-white text-xs font-semibold transition-colors rounded-lg"
                          style={{ backgroundColor: "#16A34A" }}>
                          Onayla
                        </button>
                        <button onClick={() => updateStatus(r.id, "reddedildi")} disabled={loading === r.id}
                          className="px-3 py-1.5 text-white text-xs font-semibold transition-colors rounded-lg"
                          style={{ backgroundColor: "#DC2626" }}>
                          Reddet
                        </button>
                      </div>
                    )}
                    {r.status === "onaylandi" && !r.masaId && (
                      <button onClick={() => handleOnayla(r)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        style={{ color: "#1A73E8", border: "1px solid #1A73E8" }}>
                        Masa Ata
                      </button>
                    )}
                    <button onClick={() => deleteRez(r.id)} disabled={loading === r.id}
                      className="text-xs transition-colors hover:text-red-400"
                      style={{ color: "var(--text-muted)" }}>
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
