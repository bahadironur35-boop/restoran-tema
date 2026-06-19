"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Bike, MapPin, Phone, Clock, CheckCircle, XCircle, Package, ChevronDown, Trash2, ExternalLink } from "lucide-react";

type TeslimatItem = { id: number; name: string; price: number; adet: number };
type Siparis = {
  id: number;
  musteriAdi: string;
  telefon: string;
  adres: string;
  notlar: string | null;
  durum: string;
  kurye: string | null;
  toplamTutar: number;
  items: TeslimatItem[];
  createdAt: string;
};

const DURUM: Record<string, { label: string; renk: string; icon: React.ElementType }> = {
  hazirlaniyor: { label: "Hazırlanıyor", renk: "#F59E0B", icon: Package },
  yolda:        { label: "Yolda",        renk: "#3B82F6", icon: Bike },
  teslim:       { label: "Teslim",       renk: "#22C55E", icon: CheckCircle },
  iptal:        { label: "İptal",        renk: "#EF4444", icon: XCircle },
};

const DURUM_SIRALAMA = ["hazirlaniyor", "yolda", "teslim", "iptal"];

function fmt(n: number) {
  return "₺" + n.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function saat(iso: string) {
  return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

const BOSH_FORM = { musteriAdi: "", telefon: "", adres: "", notlar: "", kurye: "" };
const BOSH_ITEM = { name: "", price: "", adet: "1" };

export default function TeslimatClient() {
  const [siparisler, setSiparisler] = useState<Siparis[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [form, setForm] = useState(BOSH_FORM);
  const [formItems, setFormItems] = useState([{ ...BOSH_ITEM }]);
  const [formAcik, setFormAcik] = useState(false);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [acik, setAcik] = useState<number | null>(null);
  const [durumYukleniyor, setDurumYukleniyor] = useState<number | null>(null);
  const [filtre, setFiltre] = useState<string>("aktif");

  const fetchSiparisler = useCallback(async () => {
    const res = await fetch("/api/admin/teslimat");
    setSiparisler(res.ok ? await res.json() : []);
    setYukleniyor(false);
  }, []);

  useEffect(() => { fetchSiparisler(); }, [fetchSiparisler]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleItemChange = (i: number, field: string, val: string) =>
    setFormItems((p) => p.map((it, idx) => idx === i ? { ...it, [field]: val } : it));

  const ekleItem = () => setFormItems((p) => [...p, { ...BOSH_ITEM }]);
  const silItem = (i: number) => setFormItems((p) => p.filter((_, idx) => idx !== i));

  const kaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    setKaydediliyor(true);
    const items = formItems
      .filter((it) => it.name && it.price)
      .map((it) => ({ name: it.name, price: parseFloat(it.price) || 0, adet: parseInt(it.adet) || 1 }));
    await fetch("/api/admin/teslimat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, items }),
    });
    setForm(BOSH_FORM);
    setFormItems([{ ...BOSH_ITEM }]);
    setFormAcik(false);
    setKaydediliyor(false);
    fetchSiparisler();
  };

  const durumGuncelle = async (id: number, durum: string) => {
    setDurumYukleniyor(id);
    await fetch(`/api/admin/teslimat/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durum }),
    });
    setDurumYukleniyor(null);
    fetchSiparisler();
  };

  const kuryeGuncelle = async (id: number, kurye: string) => {
    await fetch(`/api/admin/teslimat/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kurye }),
    });
    fetchSiparisler();
  };

  const sil = async (id: number) => {
    if (!confirm("Silinsin mi?")) return;
    await fetch(`/api/admin/teslimat/${id}`, { method: "DELETE" });
    fetchSiparisler();
  };

  const gorunen = siparisler.filter((s) => {
    if (filtre === "aktif") return s.durum === "hazirlaniyor" || s.durum === "yolda";
    if (filtre === "teslim") return s.durum === "teslim";
    if (filtre === "iptal") return s.durum === "iptal";
    return true;
  });

  const sayilar = {
    aktif: siparisler.filter((s) => s.durum === "hazirlaniyor" || s.durum === "yolda").length,
    teslim: siparisler.filter((s) => s.durum === "teslim").length,
    iptal: siparisler.filter((s) => s.durum === "iptal").length,
  };

  if (yukleniyor) return <p style={{ color: "var(--text-muted)" }}>Yükleniyor...</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--text)" }}>Teslimat / Kurye</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {sayilar.aktif} aktif · {sayilar.teslim} teslim · {sayilar.iptal} iptal
          </p>
        </div>
        <button onClick={() => setFormAcik((p) => !p)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: "#1A73E8" }}>
          <Plus size={15} /> Yeni Sipariş
        </button>
      </div>

      {/* Yeni sipariş formu */}
      {formAcik && (
        <form onSubmit={kaydet} className="card p-5 space-y-4">
          <h2 className="font-semibold text-sm" style={{ color: "var(--text)" }}>Yeni Teslimat Siparişi</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "musteriAdi", label: "Müşteri Adı", required: true },
              { name: "telefon", label: "Telefon", required: true },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>{f.label}</label>
                <input name={f.name} value={form[f.name as keyof typeof form]} onChange={handleFormChange}
                  required={f.required} className="input-field w-full px-3 py-2 text-sm" />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>Adres</label>
            <input name="adres" value={form.adres} onChange={handleFormChange} required
              className="input-field w-full px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>Kurye (opsiyonel)</label>
              <input name="kurye" value={form.kurye} onChange={handleFormChange}
                placeholder="Ad Soyad" className="input-field w-full px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>Not</label>
              <input name="notlar" value={form.notlar} onChange={handleFormChange}
                className="input-field w-full px-3 py-2 text-sm" />
            </div>
          </div>

          {/* Ürünler */}
          <div>
            <label className="block text-xs mb-2" style={{ color: "var(--text-muted)" }}>Ürünler</label>
            <div className="space-y-2">
              {formItems.map((it, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input placeholder="Ürün adı" value={it.name}
                    onChange={(e) => handleItemChange(i, "name", e.target.value)}
                    className="input-field flex-1 px-3 py-2 text-sm" />
                  <input placeholder="Fiyat" value={it.price} type="number" step="0.01"
                    onChange={(e) => handleItemChange(i, "price", e.target.value)}
                    className="input-field w-24 px-3 py-2 text-sm" />
                  <input placeholder="Adet" value={it.adet} type="number" min="1"
                    onChange={(e) => handleItemChange(i, "adet", e.target.value)}
                    className="input-field w-16 px-3 py-2 text-sm" />
                  {formItems.length > 1 && (
                    <button type="button" onClick={() => silItem(i)}>
                      <Trash2 size={14} style={{ color: "#EF4444" }} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={ekleItem}
              className="mt-2 text-xs flex items-center gap-1" style={{ color: "#1A73E8" }}>
              <Plus size={12} /> Ürün ekle
            </button>
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setFormAcik(false)}
              className="px-4 py-2 text-sm rounded-lg" style={{ color: "var(--text-muted)" }}>
              İptal
            </button>
            <button type="submit" disabled={kaydediliyor}
              className="px-5 py-2 text-sm rounded-xl font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: "#1A73E8" }}>
              {kaydediliyor ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      )}

      {/* Filtre sekmeleri */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
        {[
          { key: "aktif", label: `Aktif (${sayilar.aktif})` },
          { key: "teslim", label: `Teslim (${sayilar.teslim})` },
          { key: "iptal", label: `İptal (${sayilar.iptal})` },
          { key: "tumu", label: "Tümü" },
        ].map((f) => (
          <button key={f.key} onClick={() => setFiltre(f.key)}
            className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={filtre === f.key
              ? { backgroundColor: "#1A73E8", color: "#fff" }
              : { color: "var(--text-muted)" }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Sipariş listesi */}
      {gorunen.length === 0 ? (
        <div className="card p-10 text-center">
          <Bike size={32} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sipariş bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-3">
          {gorunen.map((s) => {
            const d = DURUM[s.durum] ?? DURUM.hazirlaniyor;
            const Icon = d.icon;
            const isAcik = acik === s.id;
            return (
              <div key={s.id} className="card overflow-hidden">
                {/* Özet satırı */}
                <button className="w-full px-5 py-4 flex items-center gap-4 text-left"
                  onClick={() => setAcik(isAcik ? null : s.id)}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: d.renk + "20" }}>
                    <Icon size={16} style={{ color: d.renk }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>#{s.id} — {s.musteriAdi}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: d.renk + "20", color: d.renk }}>
                        {d.label}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                      {s.adres} · {saat(s.createdAt)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm" style={{ color: "var(--text)" }}>{fmt(s.toplamTutar)}</p>
                    <ChevronDown size={14} className={`ml-auto transition-transform ${isAcik ? "rotate-180" : ""}`}
                      style={{ color: "var(--text-muted)" }} />
                  </div>
                </button>

                {/* Detay */}
                {isAcik && (
                  <div className="px-5 pb-5 space-y-4" style={{ borderTop: "1px solid var(--border)" }}>
                    {/* Müşteri bilgisi */}
                    <div className="pt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                        <Phone size={13} /> {s.telefon}
                      </div>
                      <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                        <MapPin size={13} /> {s.adres}
                      </div>
                      {s.kurye && (
                        <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                          <Bike size={13} /> {s.kurye}
                        </div>
                      )}
                      {s.notlar && (
                        <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                          <Clock size={13} /> {s.notlar}
                        </div>
                      )}
                    </div>

                    {/* Ürünler */}
                    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                      {s.items.map((it) => (
                        <div key={it.id} className="flex justify-between items-center px-4 py-2.5 text-sm"
                          style={{ borderBottom: "1px solid var(--border)" }}>
                          <span style={{ color: "var(--text)" }}>{it.adet}× {it.name}</span>
                          <span style={{ color: "var(--text-muted)" }}>{fmt(it.price * it.adet)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center px-4 py-2.5 font-bold text-sm"
                        style={{ backgroundColor: "var(--bg)" }}>
                        <span style={{ color: "var(--text)" }}>Toplam</span>
                        <span style={{ color: "#22C55E" }}>{fmt(s.toplamTutar)}</span>
                      </div>
                    </div>

                    {/* Kurye güncelle */}
                    <div>
                      <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>Kurye</label>
                      <input defaultValue={s.kurye ?? ""}
                        onBlur={(e) => kuryeGuncelle(s.id, e.target.value)}
                        placeholder="Kurye adı girin..."
                        className="input-field w-full px-3 py-2 text-sm" />
                    </div>

                    {/* Durum değiştir */}
                    <div>
                      <label className="block text-xs mb-2" style={{ color: "var(--text-muted)" }}>Durum</label>
                      <div className="flex gap-2 flex-wrap">
                        {DURUM_SIRALAMA.map((dk) => {
                          const dd = DURUM[dk];
                          const DIcon = dd.icon;
                          return (
                            <button key={dk}
                              disabled={s.durum === dk || durumYukleniyor === s.id}
                              onClick={() => durumGuncelle(s.id, dk)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                              style={s.durum === dk
                                ? { backgroundColor: dd.renk, color: "#fff" }
                                : { backgroundColor: dd.renk + "15", color: dd.renk, border: `1px solid ${dd.renk}40` }}>
                              <DIcon size={12} /> {dd.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Takip linki + Sil */}
                    <div className="flex items-center justify-between">
                      <a href={`/teslimat/${s.id}`} target="_blank"
                        className="flex items-center gap-1.5 text-xs"
                        style={{ color: "#1A73E8" }}>
                        <ExternalLink size={12} /> Müşteri takip linki
                      </a>
                      <button onClick={() => sil(s.id)}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg"
                        style={{ color: "#EF4444", backgroundColor: "#EF444415" }}>
                        <Trash2 size={12} /> Sil
                      </button>
                    </div>
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
