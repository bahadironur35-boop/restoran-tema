"use client";
import { useState, useEffect } from "react";
import { CreditCard, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

type OnlineOdeme = {
  id: number;
  provider: string;
  referansId: string;
  tutar: number;
  durum: string;
  musteriAdi: string | null;
  musteriEmail: string | null;
  masaId: number | null;
  teslimatId: number | null;
  createdAt: string;
  errorMsg: string | null;
};

const DURUM_CFG: Record<string, { label: string; renk: string; icon: React.ElementType }> = {
  bekliyor:    { label: "Bekliyor",    renk: "#F59E0B", icon: Clock },
  tamamlandi:  { label: "Tamamlandı", renk: "#22C55E", icon: CheckCircle },
  basarisiz:   { label: "Başarısız",  renk: "#EF4444", icon: XCircle },
  iade:        { label: "İade",       renk: "#8B5CF6", icon: RefreshCw },
};

function fmt(n: number) {
  return "₺" + n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function tarih(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function OdemelerPage() {
  const [odemeler, setOdemeler] = useState<OnlineOdeme[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    fetch("/api/admin/odemeler")
      .then((r) => r.json())
      .then((d) => { setOdemeler(d); setYukleniyor(false); });
  }, []);

  const toplamlar = {
    tamamlandi: odemeler.filter((o) => o.durum === "tamamlandi").reduce((s, o) => s + o.tutar, 0),
    bekliyor: odemeler.filter((o) => o.durum === "bekliyor").length,
    basarisiz: odemeler.filter((o) => o.durum === "basarisiz").length,
  };

  if (yukleniyor) return <p style={{ color: "var(--text-muted)" }}>Yükleniyor...</p>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-lg font-semibold" style={{ color: "var(--text)" }}>Online Ödemeler</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>İyzico ve Stripe üzerinden gelen ödemeler</p>
      </div>

      {/* Özet */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Toplam Tahsilat", value: fmt(toplamlar.tamamlandi), renk: "#22C55E", bg: "#22C55E15" },
          { label: "Bekleyen", value: toplamlar.bekliyor, renk: "#F59E0B", bg: "#F59E0B15" },
          { label: "Başarısız", value: toplamlar.basarisiz, renk: "#EF4444", bg: "#EF444415" },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-2xl font-bold" style={{ color: s.renk }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Liste */}
      {odemeler.length === 0 ? (
        <div className="card p-12 text-center">
          <CreditCard size={32} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Henüz online ödeme yok</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Tarih", "Müşteri", "Bağlantı", "Tutar", "Sağlayıcı", "Durum"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {odemeler.map((o) => {
                const d = DURUM_CFG[o.durum] ?? DURUM_CFG.bekliyor;
                const Icon = d.icon;
                return (
                  <tr key={o.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{tarih(o.createdAt)}</td>
                    <td className="px-4 py-3">
                      <p style={{ color: "var(--text)" }}>{o.musteriAdi ?? "—"}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{o.musteriEmail ?? ""}</p>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                      {o.masaId ? `Masa #${o.masaId}` : o.teslimatId ? `Teslimat #${o.teslimatId}` : "—"}
                    </td>
                    <td className="px-4 py-3 font-bold" style={{ color: "var(--text)" }}>{fmt(o.tutar)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                        style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                        {o.provider}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-xs font-medium w-fit px-2 py-1 rounded-full"
                        style={{ backgroundColor: d.renk + "20", color: d.renk }}>
                        <Icon size={11} /> {d.label}
                      </span>
                      {o.errorMsg && (
                        <p className="text-xs mt-0.5" style={{ color: "#EF4444" }}>{o.errorMsg}</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
