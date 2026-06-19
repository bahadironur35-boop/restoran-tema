"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Link2, Trash2, Package } from "lucide-react";

type MenuItem = {
  id: number; name: string; desc: string; price: string;
  category: string; active: boolean; order: number; image?: string | null;
  happyHourPrice?: string | null;
};
type StokItem = { id: number; name: string; birim: string; miktar: number };
type StokLink = { id: number; stokItemId: number; miktar: number; stokItem: StokItem };

const emptyForm = { name: "", desc: "", price: "", category: "Başlangıçlar", image: "", happyHourPrice: "" };
const categories = ["Başlangıçlar", "Ana Yemekler", "Tatlılar", "İçecekler"];

export default function MenuYonetim({ items }: { items: MenuItem[] }) {
  const [form, setForm]         = useState(emptyForm);
  const [loading, setLoading]   = useState(false);
  const [stokModal, setStokModal] = useState<MenuItem | null>(null);
  const [stoklar, setStoklar]   = useState<StokItem[]>([]);
  const [linkler, setLinkler]   = useState<StokLink[]>([]);
  const [secStok, setSecStok]   = useState("");
  const [secMiktar, setSecMiktar] = useState("1");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/menu", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(emptyForm); setLoading(false); router.refresh();
  };

  const toggleActive = async (id: number, active: boolean) => {
    await fetch(`/api/admin/menu/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
  };

  const deleteItem = async (id: number) => {
    if (!confirm("Bu menü öğesini silmek istediğinizden emin misiniz?")) return;
    await fetch(`/api/admin/menu/${id}`, { method: "DELETE" });
    router.refresh();
  };

  // Stok modal açılınca verileri çek
  useEffect(() => {
    if (!stokModal) return;
    fetch("/api/admin/stok").then((r) => r.json()).then(setStoklar);
    fetch(`/api/admin/menu/${stokModal.id}/stok`).then((r) => r.json()).then(setLinkler);
  }, [stokModal]);

  const addLink = async () => {
    if (!stokModal || !secStok) return;
    const res = await fetch(`/api/admin/menu/${stokModal.id}/stok`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stokItemId: Number(secStok), miktar: Number(secMiktar) }),
    });
    const yeni = await res.json();
    setLinkler((p) => [...p, yeni]);
    setSecStok(""); setSecMiktar("1");
  };

  const removeLink = async (linkId: number) => {
    if (!stokModal) return;
    await fetch(`/api/admin/menu/${stokModal.id}/stok`, {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkId }),
    });
    setLinkler((p) => p.filter((l) => l.id !== linkId));
  };

  const grouped = categories.reduce<Record<string, MenuItem[]>>((acc, cat) => {
    acc[cat] = items.filter((i) => i.category === cat);
    return acc;
  }, {});

  const inputCls = "input-field";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* Stok bağlama modal */}
      {stokModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="rounded-2xl w-full max-w-md flex flex-col max-h-[85vh]"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <div>
                <p className="font-semibold" style={{ color: "var(--text)" }}>{stokModal.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Stok Bağlantıları</p>
              </div>
              <button onClick={() => setStokModal(null)} className="text-xl leading-none" style={{ color: "var(--text-muted)" }}>×</button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {/* Mevcut linkler */}
              {linkler.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>
                  Henüz stok bağlantısı yok
                </p>
              ) : (
                <div className="space-y-2">
                  {linkler.map((l) => (
                    <div key={l.id} className="flex items-center justify-between p-3 rounded-xl"
                      style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{l.stokItem.name}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {l.miktar} {l.stokItem.birim} / sipariş
                        </p>
                      </div>
                      <button onClick={() => removeLink(l.id)}>
                        <Trash2 size={14} className="hover:text-red-400 transition-colors" style={{ color: "var(--text-muted)" }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Yeni link ekle */}
              <div className="pt-2 border-t space-y-3" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Stok Kalemi Ekle</p>
                <select value={secStok} onChange={(e) => setSecStok(e.target.value)} className={`${inputCls} w-full`}>
                  <option value="">Stok kalemi seç...</option>
                  {stoklar.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (mevcut: {s.miktar} {s.birim})
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>Miktar / sipariş</label>
                    <input type="number" min="0.01" step="0.01" value={secMiktar}
                      onChange={(e) => setSecMiktar(e.target.value)}
                      className={`${inputCls} w-full`} />
                  </div>
                  <button onClick={addLink} disabled={!secStok}
                    className="btn-primary self-end text-xs px-4 disabled:opacity-40">
                    Ekle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ekleme formu */}
      <div className="lg:col-span-1">
        <div className="card p-6">
          <h2 className="font-semibold mb-4 uppercase tracking-wider text-sm" style={{ color: "var(--text)" }}>Yeni Öğe Ekle</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-xs mb-1 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Kategori</label>
              <select name="category" value={form.category} onChange={handleChange} className={inputCls}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Adı *</label>
              <input name="name" value={form.name} onChange={handleChange} required className={inputCls} placeholder="Wagyu Biftek" />
            </div>
            <div>
              <label className="block text-xs mb-1 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Açıklama *</label>
              <textarea name="desc" value={form.desc} onChange={handleChange} required rows={2} className={inputCls} placeholder="Malzemeler..." />
            </div>
            <div>
              <label className="block text-xs mb-1 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Fiyat *</label>
              <input name="price" value={form.price} onChange={handleChange} required className={inputCls} placeholder="₺250" />
            </div>
            <div>
              <label className="block text-xs mb-1 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Happy Hour Fiyatı</label>
              <input name="happyHourPrice" value={form.happyHourPrice} onChange={handleChange} className={inputCls} placeholder="₺180 (boş bırakılırsa happy hour yok)" />
            </div>
            <div>
              <label className="block text-xs mb-1 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Fotoğraf URL</label>
              <input name="image" value={form.image} onChange={handleChange} className={inputCls} placeholder="https://..." />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full text-xs tracking-widest uppercase">
              {loading ? "Ekleniyor..." : "Ekle"}
            </button>
          </form>
        </div>
      </div>

      {/* Liste */}
      <div className="lg:col-span-2 space-y-6">
        {categories.map((cat) => (
          <div key={cat} className="card p-6">
            <h2 className="font-semibold mb-4 uppercase tracking-wider text-sm" style={{ color: "var(--text)" }}>{cat}</h2>
            {grouped[cat].length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Bu kategoride öğe yok.</p>
            ) : (
              <div className="space-y-2">
                {grouped[cat].map((item) => (
                  <div key={item.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${!item.active ? "opacity-40" : ""}`}
                    style={{ border: "1px solid var(--border)" }}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" style={{ color: "var(--text)" }}>{item.name}</p>
                      <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                    </div>
                    <div className="mx-4 text-right whitespace-nowrap">
                      <span className="text-sm font-bold block" style={{ color: "#1A73E8" }}>{item.price}</span>
                      {item.happyHourPrice && (
                        <span className="text-xs font-semibold" style={{ color: "#F59E0B" }}>⚡ {item.happyHourPrice}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(item.id, item.active)}
                        className={item.active ? "badge badge-green" : "badge"}>
                        {item.active ? "Aktif" : "Pasif"}
                      </button>
                      <button
                        onClick={() => setStokModal(item)}
                        title="Stok bağlantıları"
                        className="p-1 rounded transition-colors hover:bg-white/5"
                      >
                        <Package size={14} style={{ color: "var(--text-muted)" }} />
                      </button>
                      <button onClick={() => deleteItem(item.id)}
                        className="text-xs px-1 transition-colors hover:text-red-400"
                        style={{ color: "var(--text-muted)" }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
