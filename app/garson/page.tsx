"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Plus, ChevronRight, CheckCircle, Clock } from "lucide-react";

type Talep = { id: number; tip: string; createdAt: string };
type Masa = { id: number; no: number; alan: string; durum: string; kapasite: number; talepler: Talep[] };
type SiparisItem = { id: number; name: string; adet: number; price: string; not: string | null };
type Siparis = { id: number; durum: string; createdAt: string; items: SiparisItem[] };

const DURUM_RENK: Record<string, string> = {
  bos: "#1E293B",
  dolu: "#1A3A5C",
  temizleniyor: "#2D1F4A",
  rezerveli: "#1A3A2A",
};
const DURUM_BORDER: Record<string, string> = {
  bos: "#334155",
  dolu: "#1A73E8",
  temizleniyor: "#8B5CF6",
  rezerveli: "#22C55E",
};
const DURUM_LABEL: Record<string, string> = {
  bos: "Boş", dolu: "Dolu", temizleniyor: "Temizleniyor", rezerveli: "Rezerveli",
};

function fmt(n: number) { return "₺" + n.toLocaleString("tr-TR", { minimumFractionDigits: 0 }); }
function parsePrice(p: string) { return parseFloat(p.replace(/[^\d.,]/g, "").replace(",", ".")) || 0; }
function saat(iso: string) {
  return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

export default function GarsonPage() {
  const router = useRouter();
  const [masalar, setMasalar] = useState<Masa[]>([]);
  const [secili, setSecili] = useState<Masa | null>(null);
  const [siparisler, setSiparisler] = useState<Siparis[]>([]);
  const [siparisYukleniyor, setSiparisYukleniyor] = useState(false);
  const [talepler, setTalepler] = useState<{ masaNo: number; tip: string }[]>([]);
  const bildirildi = useRef<Set<number>>(new Set());

  const fetchMasalar = useCallback(async () => {
    const res = await fetch("/api/events?scope=masalar");
    // SSE değil, anlık veri için ayrı endpoint kullanalım
  }, []);

  // SSE ile masa verisi
  useEffect(() => {
    let es: EventSource;
    let retry: ReturnType<typeof setTimeout>;

    const connect = () => {
      es = new EventSource("/api/events?scope=masalar");
      es.addEventListener("update", (e) => {
        try {
          const { masalar: yeni } = JSON.parse(e.data) as { masalar: Masa[] };
          if (!yeni) return;
          setMasalar(yeni);
          // Yeni talepler
          const yeniTalepler: { masaNo: number; tip: string }[] = [];
          for (const m of yeni) {
            for (const t of (m.talepler ?? [])) {
              if (!bildirildi.current.has(t.id)) {
                bildirildi.current.add(t.id);
                yeniTalepler.push({ masaNo: m.no, tip: t.tip });
                try {
                  const ctx = new AudioContext();
                  const osc = ctx.createOscillator(); const g = ctx.createGain();
                  osc.connect(g); g.connect(ctx.destination);
                  osc.frequency.value = t.tip === "hesap" ? 660 : 880; osc.type = "sine";
                  g.gain.setValueAtTime(0.3, ctx.currentTime);
                  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                  osc.start(); osc.stop(ctx.currentTime + 0.35);
                } catch { /* ignore */ }
              }
            }
          }
          if (yeniTalepler.length > 0) {
            setTalepler((p) => [...p, ...yeniTalepler]);
            setTimeout(() => setTalepler((p) => p.slice(yeniTalepler.length)), 8000);
          }
        } catch { /* ignore */ }
      });
      es.onerror = () => { es.close(); retry = setTimeout(connect, 2000); };
    };
    connect();
    return () => { es?.close(); clearTimeout(retry); };
  }, []);

  const masaAc = async (m: Masa) => {
    setSecili(m);
    setSiparisYukleniyor(true);
    const res = await fetch(`/api/admin/siparis?masaId=${m.id}`);
    setSiparisler(res.ok ? await res.json() : []);
    setSiparisYukleniyor(false);
  };

  const talepleriTemizle = async (masaId: number) => {
    await fetch(`/api/admin/masalar/${masaId}/talepler`, { method: "DELETE" });
  };

  const cikis = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/garson/login");
  };

  const dolular = masalar.filter((m) => m.durum === "dolu").length;
  const bekleyenTalep = masalar.reduce((s, m) => s + (m.talepler?.length ?? 0), 0);

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#0F172A" }}>
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: "#0F172A", borderBottom: "1px solid #1E293B" }}>
        <div>
          <p className="font-bold text-white text-base">Masalar</p>
          <p className="text-xs" style={{ color: "#64748B" }}>{dolular} dolu · {masalar.length} toplam</p>
        </div>
        <div className="flex items-center gap-2">
          {bekleyenTalep > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: "#EF444420", border: "1px solid #EF444440" }}>
              <Bell size={13} style={{ color: "#EF4444" }} />
              <span className="text-xs font-bold" style={{ color: "#EF4444" }}>{bekleyenTalep}</span>
            </div>
          )}
          <button onClick={cikis} className="w-9 h-9 flex items-center justify-center rounded-xl"
            style={{ backgroundColor: "#1E293B" }}>
            <LogOut size={16} style={{ color: "#64748B" }} />
          </button>
        </div>
      </div>

      {/* Talep bildirimleri */}
      {talepler.length > 0 && (
        <div className="mx-4 mt-3 space-y-2">
          {talepler.map((t, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ backgroundColor: t.tip === "hesap" ? "#92400E30" : "#1E3A5F", border: `1px solid ${t.tip === "hesap" ? "#F59E0B50" : "#3B82F650"}` }}>
              <span className="text-xl">{t.tip === "hesap" ? "💳" : "🔔"}</span>
              <div>
                <p className="font-bold text-sm text-white">Masa {t.masaNo}</p>
                <p className="text-xs" style={{ color: "#94A3B8" }}>{t.tip === "hesap" ? "Hesap istiyor" : "Garson çağırıyor"}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Masa grid */}
      <div className="p-4 grid grid-cols-3 gap-3">
        {masalar.map((m) => {
          const talep = m.talepler?.length > 0;
          return (
            <button key={m.id} onClick={() => masaAc(m)}
              className="relative rounded-2xl p-4 text-left transition-all active:scale-95"
              style={{
                backgroundColor: DURUM_RENK[m.durum] ?? "#1E293B",
                border: `2px solid ${talep ? "#EF4444" : DURUM_BORDER[m.durum] ?? "#334155"}`,
                minHeight: "90px",
              }}>
              {talep && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: "#EF4444" }}>
                  {m.talepler.length}
                </div>
              )}
              <p className="text-2xl font-bold text-white leading-none">{m.no}</p>
              <p className="text-xs mt-1" style={{ color: "#64748B" }}>{m.alan}</p>
              <p className="text-xs mt-2 font-medium"
                style={{ color: DURUM_BORDER[m.durum] ?? "#64748B" }}>
                {DURUM_LABEL[m.durum] ?? m.durum}
              </p>
            </button>
          );
        })}
      </div>

      {/* Masa detay modal */}
      {secili && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={(e) => e.target === e.currentTarget && setSecili(null)}>
          <div className="rounded-t-3xl overflow-hidden flex flex-col max-h-[85vh]"
            style={{ backgroundColor: "#1E293B" }}>

            {/* Modal header */}
            <div className="px-5 pt-5 pb-3 flex items-start justify-between flex-shrink-0">
              <div>
                <p className="text-xl font-bold text-white">Masa {secili.no}</p>
                <p className="text-sm" style={{ color: "#64748B" }}>{secili.alan} · {secili.kapasite} kişilik</p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ backgroundColor: DURUM_BORDER[secili.durum] + "20", color: DURUM_BORDER[secili.durum] }}>
                  {DURUM_LABEL[secili.durum] ?? secili.durum}
                </span>
              </div>
            </div>

            {/* Bekleyen talepler */}
            {secili.talepler?.length > 0 && (
              <div className="mx-5 mb-3 px-4 py-3 rounded-xl flex items-center justify-between"
                style={{ backgroundColor: "#EF444415", border: "1px solid #EF444430" }}>
                <div className="flex items-center gap-2">
                  <Bell size={14} style={{ color: "#EF4444" }} />
                  <span className="text-sm font-medium" style={{ color: "#EF4444" }}>
                    {secili.talepler.map((t) => t.tip === "hesap" ? "Hesap isteniyor" : "Garson çağrısı").join(" · ")}
                  </span>
                </div>
                <button onClick={() => talepleriTemizle(secili.id)}
                  className="text-xs px-2 py-1 rounded-lg font-medium"
                  style={{ backgroundColor: "#EF444420", color: "#EF4444" }}>
                  Tamam
                </button>
              </div>
            )}

            {/* Sipariş listesi */}
            <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-3">
              {siparisYukleniyor ? (
                <p className="text-center py-8 text-sm" style={{ color: "#64748B" }}>Yükleniyor...</p>
              ) : siparisler.filter((s) => s.durum !== "teslim").length === 0 ? (
                <p className="text-center py-8 text-sm" style={{ color: "#64748B" }}>Aktif sipariş yok</p>
              ) : (
                siparisler.filter((s) => s.durum !== "teslim").map((s) => {
                  const toplam = s.items.reduce((sum, i) => sum + parsePrice(i.price) * i.adet, 0);
                  const durumRenk: Record<string, string> = { bekliyor: "#F59E0B", hazirlaniyor: "#3B82F6", hazir: "#22C55E" };
                  const durumLabel: Record<string, string> = { bekliyor: "Bekliyor", hazirlaniyor: "Hazırlanıyor", hazir: "Hazır ✓" };
                  return (
                    <div key={s.id} className="rounded-xl p-4" style={{ backgroundColor: "#0F172A" }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock size={12} style={{ color: "#64748B" }} />
                          <span className="text-xs" style={{ color: "#64748B" }}>{saat(s.createdAt)}</span>
                        </div>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: (durumRenk[s.durum] ?? "#64748B") + "20", color: durumRenk[s.durum] ?? "#64748B" }}>
                          {durumLabel[s.durum] ?? s.durum}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {s.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <div className="flex gap-2 text-sm">
                              <span className="font-bold" style={{ color: "#1A73E8" }}>{item.adet}×</span>
                              <span className="text-white">{item.name}</span>
                              {item.not && <span className="text-xs" style={{ color: "#F59E0B" }}>({item.not})</span>}
                            </div>
                            <span className="text-sm" style={{ color: "#64748B" }}>{fmt(parsePrice(item.price) * item.adet)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 flex justify-end" style={{ borderTop: "1px solid #1E293B" }}>
                        <span className="text-sm font-bold" style={{ color: "#22C55E" }}>{fmt(toplam)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Alt butonlar */}
            <div className="px-5 py-4 flex gap-3 flex-shrink-0" style={{ borderTop: "1px solid #0F172A" }}>
              <button
                onClick={() => router.push(`/admin/pos?masaId=${secili.id}`)}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white"
                style={{ backgroundColor: "#1A73E8" }}>
                <Plus size={18} /> Sipariş Ekle
              </button>
              <button
                onClick={() => router.push(`/admin/kasa`)}
                className="flex items-center justify-center gap-1.5 px-5 py-4 rounded-2xl font-bold"
                style={{ backgroundColor: "#16A34A20", color: "#22C55E", border: "1px solid #22C55E40" }}>
                Hesap <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
