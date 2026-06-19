"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag } from "lucide-react";

type Kupon = {
  id: number; kod: string; tur: string; deger: number;
  minTutar: number | null; kullanimLimit: number | null; kullanimSayisi: number;
  gecerlilikSonu: string | null; aktif: boolean; createdAt: string;
};

function fmt(n: number) { return "₺" + n.toLocaleString("tr-TR", { minimumFractionDigits: 0 }); }

export default function KuponlarClient() {
  const [kuponlar, setKuponlar] = useState<Kupon[]>([]);
  const [form, setForm] = useState({ kod: "", tur: "yuzde", deger: "", minTutar: "", kullanimLimit: "", gecerlilikSonu: "" });
  const [formAcik, setFormAcik] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  const fetch_ = useCallback(async () => {
    const res = await fetch("/api/admin/kuponlar");
    setKuponlar(await res.json());
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const kaydet = async () => {
    if (!form.kod || !form.deger) { setHata("Kod ve değer zorunlu"); return; }
    setYukleniyor(true); setHata("");
    const res = await fetch("/api/admin/kuponlar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ kod: "", tur: "yuzde", deger: "", minTutar: "", kullanimLimit: "", gecerlilikSonu: "" });
      setFormAcik(false);
      fetch_();
    } else {
      const d = await res.json();
      setHata(d.error ?? "Hata oluştu");
    }
    setYukleniyor(false);
  };

  const toggleAktif = async (k: Kupon) => {
    await fetch(`/api/admin/kuponlar/${k.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aktif: !k.aktif }),
    });
    fetch_();
  };

  const sil = async (id: number) => {
    if (!confirm("Kuponu silmek istediğine emin misin?")) return;
    await fetch(`/api/admin/kuponlar/${id}`, { method: "DELETE" });
    fetch_();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--text)" }}>Kuponlar</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>İndirim kuponları tanımla ve yönet</p>
        </div>
        <button onClick={() => setFormAcik(true)} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus size={15} /> Yeni Kupon
        </button>
      </div>

      {/* Yeni kupon formu */}
      {formAcik && (
        <div className="card p-5 space-y-4">
          <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>Yeni Kupon</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Kupon Kodu *</label>
              <input value={form.kod} onChange={(e) => setForm({ ...form, kod: e.target.value.toUpperCase() })}
                className="input-field w-full" placeholder="YEMEK20" />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>İndirim Türü *</label>
              <select value={form.tur} onChange={(e) => setForm({ ...form, tur: e.target.value })}
                className="input-field w-full">
                <option value="yuzde">Yüzde (%)</option>
                <option value="sabit">Sabit Tutar (₺)</option>
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>
                İndirim Değeri * {form.tur === "yuzde" ? "(%)" : "(₺)"}
              </label>
              <input value={form.deger} onChange={(e) => setForm({ ...form, deger: e.target.value })}
                className="input-field w-full" type="number" min="0" placeholder={form.tur === "yuzde" ? "20" : "50"} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Min. Sepet Tutarı (₺)</label>
              <input value={form.minTutar} onChange={(e) => setForm({ ...form, minTutar: e.target.value })}
                className="input-field w-full" type="number" min="0" placeholder="Opsiyonel" />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Kullanım Limiti</label>
              <input value={form.kullanimLimit} onChange={(e) => setForm({ ...form, kullanimLimit: e.target.value })}
                className="input-field w-full" type="number" min="1" placeholder="Sınırsız" />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Son Kullanım Tarihi</label>
              <input value={form.gecerlilikSonu} onChange={(e) => setForm({ ...form, gecerlilikSonu: e.target.value })}
                className="input-field w-full" type="date" />
            </div>
          </div>
          {hata && <p className="text-xs" style={{ color: "#EF4444" }}>{hata}</p>}
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setFormAcik(false); setHata(""); }}
              className="px-4 py-2 text-sm rounded-lg" style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              İptal
            </button>
            <button onClick={kaydet} disabled={yukleniyor} className="btn-primary px-4 py-2 text-sm">
              {yukleniyor ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      )}

      {/* Kupon listesi */}
      {kuponlar.length === 0 ? (
        <div className="card p-12 text-center space-y-2">
          <Tag size={32} className="mx-auto opacity-20" style={{ color: "var(--text-muted)" }} />
          <p style={{ color: "var(--text-muted)" }}>Henüz kupon tanımlanmamış</p>
        </div>
      ) : (
        <div className="space-y-3">
          {kuponlar.map((k) => {
            const doldu = k.kullanimLimit !== null && k.kullanimSayisi >= k.kullanimLimit;
            const suresi = k.gecerlilikSonu && new Date(k.gecerlilikSonu) < new Date();
            const gecersiz = doldu || !!suresi;
            return (
              <div key={k.id} className="card p-4 flex items-center gap-4"
                style={{ opacity: !k.aktif || gecersiz ? 0.6 : 1 }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold font-mono text-sm px-2 py-0.5 rounded"
                      style={{ backgroundColor: "var(--bg)", color: "#1A73E8", border: "1px solid var(--border)" }}>
                      {k.kod}
                    </span>
                    <span className="text-sm font-bold" style={{ color: "#22C55E" }}>
                      {k.tur === "yuzde" ? `%${k.deger}` : fmt(k.deger)} indirim
                    </span>
                    {!k.aktif && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EF444415", color: "#EF4444" }}>Pasif</span>}
                    {gecersiz && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F59E0B15", color: "#F59E0B" }}>{doldu ? "Limit Doldu" : "Süresi Doldu"}</span>}
                  </div>
                  <div className="flex gap-3 mt-1 flex-wrap">
                    {k.minTutar && <span className="text-xs" style={{ color: "var(--text-muted)" }}>Min: {fmt(k.minTutar)}</span>}
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Kullanım: {k.kullanimSayisi}{k.kullanimLimit ? `/${k.kullanimLimit}` : ""}
                    </span>
                    {k.gecerlilikSonu && (
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Son: {new Date(k.gecerlilikSonu).toLocaleDateString("tr-TR")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleAktif(k)} title={k.aktif ? "Pasife Al" : "Aktife Al"}>
                    {k.aktif
                      ? <ToggleRight size={22} style={{ color: "#22C55E" }} />
                      : <ToggleLeft size={22} style={{ color: "var(--text-muted)" }} />}
                  </button>
                  <button onClick={() => sil(k.id)}>
                    <Trash2 size={16} style={{ color: "#EF4444" }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
