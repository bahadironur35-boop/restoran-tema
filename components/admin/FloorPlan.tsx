"use client";
import { useState, useEffect, useCallback, useRef } from "react";

type Masa = { id: number; no: number; kapasite: number; alan: string; durum: string; posX: number; posY: number };

const DURUM = {
  bos:          { label: "Boş",          color: "#16A34A", bg: "#16A34A22", border: "#16A34A" },
  dolu:         { label: "Dolu",         color: "#EF4444", bg: "#EF444422", border: "#EF4444" },
  temizleniyor: { label: "Temizleniyor", color: "#8B5CF6", bg: "#8B5CF622", border: "#8B5CF6" },
  rezerveli:    { label: "Rezerveli",    color: "#F59E0B", bg: "#F59E0B22", border: "#F59E0B" },
};

const CANVAS_W = 900;
const CANVAS_H = 560;
const TABLE_SIZE = 64;

export default function FloorPlan() {
  const [masalar, setMasalar] = useState<Masa[]>([]);
  const [aktifAlan, setAktifAlan] = useState("Tümü");
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; masa: Masa } | null>(null);
  const [kapatLoading, setKapatLoading] = useState<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const fetchMasalar = useCallback(async () => {
    const res = await fetch("/api/admin/masalar");
    setMasalar(await res.json());
  }, []);

  useEffect(() => {
    fetchMasalar();
    const iv = setInterval(fetchMasalar, 10000);
    return () => clearInterval(iv);
  }, [fetchMasalar]);

  const alanlar = Array.from(new Set(masalar.map((m) => m.alan))).sort();
  const goruntulenen = aktifAlan === "Tümü" ? masalar : masalar.filter((m) => m.alan === aktifAlan);

  const toggleDurum = async (masa: Masa) => {
    const sira = ["bos", "dolu", "temizleniyor", "rezerveli"];
    const next = sira[(sira.indexOf(masa.durum) + 1) % sira.length];
    await fetch(`/api/admin/masalar/${masa.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durum: next }),
    });
    setMasalar((prev) => prev.map((m) => m.id === masa.id ? { ...m, durum: next } : m));
  };

  const savePosition = async (id: number, posX: number, posY: number) => {
    await fetch(`/api/admin/masalar/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ posX, posY }),
    });
  };

  const onMouseDown = (e: React.MouseEvent, masaId: number) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const masa = masalar.find((m) => m.id === masaId);
    if (!masa) return;
    const tableX = (masa.posX / 100) * CANVAS_W;
    const tableY = (masa.posY / 100) * CANVAS_H;
    setDragOffset({
      x: e.clientX - rect.left - tableX,
      y: e.clientY - rect.top - tableY,
    });
    setDragging(masaId);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (dragging === null) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rawX = e.clientX - rect.left - dragOffset.x;
    const rawY = e.clientY - rect.top - dragOffset.y;
    const clampedX = Math.max(0, Math.min(CANVAS_W - TABLE_SIZE, rawX));
    const clampedY = Math.max(0, Math.min(CANVAS_H - TABLE_SIZE, rawY));
    const posX = (clampedX / CANVAS_W) * 100;
    const posY = (clampedY / CANVAS_H) * 100;
    setMasalar((prev) => prev.map((m) => m.id === dragging ? { ...m, posX, posY } : m));
  };

  const onMouseUp = () => {
    if (dragging === null) return;
    const masa = masalar.find((m) => m.id === dragging);
    if (masa) savePosition(masa.id, masa.posX, masa.posY);
    setDragging(null);
  };

  const onContextMenu = (e: React.MouseEvent, masa: Masa) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY, masa });
  };

  const kapatMasa = async (masa: Masa) => {
    setKapatLoading(masa.id);
    await fetch(`/api/admin/masalar/${masa.id}/kapat`, { method: "POST" });
    setCtxMenu(null);
    setKapatLoading(null);
    fetchMasalar();
  };

  const ozet = {
    toplam: masalar.length,
    bos: masalar.filter((m) => m.durum === "bos").length,
    dolu: masalar.filter((m) => m.durum === "dolu").length,
    rezerveli: masalar.filter((m) => m.durum === "rezerveli").length,
    temizleniyor: masalar.filter((m) => m.durum === "temizleniyor").length,
  };

  return (
    <div className="space-y-4">
      {/* Başlık + İstatistikler */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--text)" }}>Masa Planı</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Masaları sürükleyerek konumlandırın · Tıklayarak durumu değiştirin
          </p>
        </div>
        <div className="flex gap-3">
          {[
            { label: "Toplam", value: ozet.toplam, color: "var(--text)" },
            { label: "Boş",      value: ozet.bos,          color: "#16A34A" },
            { label: "Dolu",     value: ozet.dolu,         color: "#EF4444" },
            { label: "Temizlik", value: ozet.temizleniyor, color: "#8B5CF6" },
            { label: "Rezerve",  value: ozet.rezerveli,    color: "#F59E0B" },
          ].map((s) => (
            <div key={s.label} className="card px-4 py-2 text-center min-w-[56px]">
              <p className="text-xl font-bold leading-none" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alan filtreleri */}
      {alanlar.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {["Tümü", ...alanlar].map((a) => (
            <button key={a} onClick={() => setAktifAlan(a)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
              style={aktifAlan === a
                ? { backgroundColor: "#1A73E8", color: "#fff" }
                : { backgroundColor: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }
              }>
              {a}
            </button>
          ))}
        </div>
      )}

      {/* Context menü */}
      {ctxMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setCtxMenu(null)} />
          <div
            className="fixed z-50 rounded-xl shadow-2xl overflow-hidden"
            style={{ top: ctxMenu.y, left: ctxMenu.x, backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", minWidth: 180 }}
          >
            <div className="px-4 py-2 border-b" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs font-bold" style={{ color: "var(--text)" }}>Masa {ctxMenu.masa.no}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{ctxMenu.masa.alan}</p>
            </div>
            <button
              onClick={() => { toggleDurum(ctxMenu.masa); setCtxMenu(null); }}
              className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
              style={{ color: "var(--text)" }}
            >
              Durum Değiştir →
            </button>
            {ctxMenu.masa.durum !== "bos" && (
              <button
                onClick={() => kapatMasa(ctxMenu.masa)}
                disabled={kapatLoading === ctxMenu.masa.id}
                className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-red-500/10 disabled:opacity-50"
                style={{ color: "#EF4444" }}
              >
                {kapatLoading === ctxMenu.masa.id ? "Kapatılıyor..." : "Masayı Kapat"}
              </button>
            )}
          </div>
        </>
      )}

      {/* Canvas */}
      <div
        className="relative rounded-xl overflow-hidden select-none"
        style={{
          width: "100%",
          aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
          backgroundColor: "#0D1B2A",
          border: "1px solid rgba(255,255,255,0.06)",
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          cursor: dragging ? "grabbing" : "default",
        }}
        ref={canvasRef}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {goruntulenen.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p style={{ color: "rgba(255,255,255,0.2)" }} className="text-sm">Henüz masa eklenmedi</p>
          </div>
        )}

        {goruntulenen.map((masa) => {
          const cfg = DURUM[masa.durum as keyof typeof DURUM] ?? DURUM.bos;
          const x = (masa.posX / 100) * CANVAS_W;
          const y = (masa.posY / 100) * CANVAS_H;
          const isDragging = dragging === masa.id;

          return (
            <div
              key={masa.id}
              onMouseDown={(e) => onMouseDown(e, masa.id)}
              onClick={() => !isDragging && toggleDurum(masa)}
              onContextMenu={(e) => onContextMenu(e, masa)}
              className="absolute flex flex-col items-center justify-center rounded-xl transition-shadow"
              style={{
                width: TABLE_SIZE,
                height: TABLE_SIZE,
                left: x,
                top: y,
                backgroundColor: cfg.bg,
                border: `2px solid ${cfg.border}`,
                cursor: isDragging ? "grabbing" : "grab",
                boxShadow: isDragging ? `0 8px 32px ${cfg.color}55` : `0 2px 8px rgba(0,0,0,0.4)`,
                zIndex: isDragging ? 50 : 1,
                transform: isDragging ? "scale(1.08)" : "scale(1)",
                transition: isDragging ? "none" : "transform 0.15s, box-shadow 0.15s",
              }}
            >
              <span className="text-2xl font-bold leading-none" style={{ color: cfg.color }}>{masa.no}</span>
              <span className="text-[9px] mt-0.5 font-medium" style={{ color: cfg.color, opacity: 0.8 }}>{masa.kapasite}kş</span>
              <span className="text-[8px] mt-0.5 font-semibold uppercase tracking-wide"
                style={{ color: "rgba(255,255,255,0.35)" }}>{masa.alan}</span>
            </div>
          );
        })}
      </div>

      {/* Lejant */}
      <div className="flex gap-6">
        {Object.entries(DURUM).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cfg.color }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{cfg.label}</span>
          </div>
        ))}
        <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>
          10sn'de bir güncellenir
        </span>
      </div>
    </div>
  );
}
