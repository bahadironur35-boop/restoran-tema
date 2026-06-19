"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Link2, Trash2, Package, Plus, Pencil, Check, X, ChevronUp, ChevronDown, Tags } from "lucide-react";

type MenuItem = {
  id: number; name: string; desc: string; price: string;
  category: string; active: boolean; order: number; image?: string | null;
  happyHourPrice?: string | null;
};
type StokItem = { id: number; name: string; birim: string; miktar: number };
type StokLink = { id: number; stokItemId: number; miktar: number; stokItem: StokItem };

const inputCls = "input-field";

export default function MenuYonetim({
  items,
  initialKategoriler,
}: {
  items: MenuItem[];
  initialKategoriler: string[];
}) {
  const router = useRouter();

  // --- Kategori state ---
  const [kategoriler, setKategoriler] = useState<string[]>(initialKategoriler);
  const [katPanel, setKatPanel]       = useState(false);
  const [yeniKat, setYeniKat]         = useState("");
  const [katLoading, setKatLoading]   = useState(false);
  const [editKat, setEditKat]         = useState<string | null>(null);
  const [editKatVal, setEditKatVal]   = useState("");

  // --- Menü form state ---
  const emptyForm = { name: "", desc: "", price: "", category: kategoriler[0] ?? "", image: "", happyHourPrice: "" };
  const [form, setForm]             = useState(emptyForm);
  const [loading, setLoading]       = useState(false);
  const [stokModal, setStokModal]   = useState<MenuItem | null>(null);
  const [stoklar, setStoklar]       = useState<StokItem[]>([]);
  const [linkler, setLinkler]       = useState<StokLink[]>([]);
  const [secStok, setSecStok]       = useState("");
  const [secMiktar, setSecMiktar]   = useState("1");

  // Kategori değişince form.category'yi de güncelle
  useEffect(() => {
    setForm((p) => ({ ...p, category: kategoriler[0] ?? "" }));
  }, [kategoriler]);

  // Stok modal
  useEffect(() => {
    if (!stokModal) return;
    fetch("/api/admin/stok").then((r) => r.json()).then(setStoklar);
    fetch(`/api/admin/menu/${stokModal.id}/stok`).then((r) => r.json()).then(setLinkler);
  }, [stokModal]);

  // ---- Kategori işlemleri ----
  async function katApi(body: object) {
    const r = await fetch("/api/admin/menu/kategoriler", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await r.json();
    if (!r.ok) { alert(json.error); return null; }
    return json as string[];
  }

  const addKat = async () => {
    const trimmed = yeniKat.trim();
    if (!trimmed) return;
    setKatLoading(true);
    const sonuc = await katApi({ action: "add", name: trimmed });
    if (sonuc) { setKategoriler(sonuc); setYeniKat(""); router.refresh(); }
    setKatLoading(false);
  };

  const deleteKat = async (name: string) => {
    if (!confirm(`"${name}" kategorisini silmek istediğinizden emin misiniz?`)) return;
    setKatLoading(true);
    const sonuc = await katApi({ action: "delete", name });
    if (sonuc) { setKategoriler(sonuc); router.refresh(); }
    setKatLoading(false);
  };

  const renameKat = async (name: string) => {
    const trimmed = editKatVal.trim();
    if (!trimmed || trimmed === name) { setEditKat(null); return; }
    setKatLoading(true);
    const sonuc = await katApi({ action: "rename", name, newName: trimmed });
    if (sonuc) { setKategoriler(sonuc); setEditKat(null); router.refresh(); }
    setKatLoading(false);
  };

  const moveKat = async (idx: number, dir: -1 | 1) => {
    const next = idx + dir;
    if (next < 0 || next >= kategoriler.length) return;
    const arr = [...kategoriler];
    [arr[idx], arr[next]] = [arr[next], arr[idx]];
    setKategoriler(arr);
    await fetch("/api/admin/menu/kategoriler", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kategoriler: arr }),
    });
  };

  // ---- Menü işlemleri ----
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/menu", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ ...emptyForm, category: form.category });
    setLoading(false);
    router.refresh();
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

  const grouped = kategoriler.reduce<Record<string, MenuItem[]>>((acc, cat) => {
    acc[cat] = items.filter((i) => i.category === cat);
    return acc;
  }, {});
  // Kategorisiz öğeler (silinmiş/değiştirilmiş kategori adı)
  const uncategorized = items.filter((i) => !kategoriler.includes(i.category));

  return (
    <div className="space-y-6">

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
              {linkler.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>Henüz stok bağlantısı yok</p>
              ) : (
                <div className="space-y-2">
                  {linkler.map((l) => (
                    <div key={l.id} className="flex items-center justify-between p-3 rounded-xl"
                      style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{l.stokItem.name}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{l.miktar} {l.stokItem.birim} / sipariş</p>
                      </div>
                      <button onClick={() => removeLink(l.id)}>
                        <Trash2 size={14} className="hover:text-red-400 transition-colors" style={{ color: "var(--text-muted)" }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="pt-2 border-t space-y-3" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Stok Kalemi Ekle</p>
                <select value={secStok} onChange={(e) => setSecStok(e.target.value)} className={`${inputCls} w-full`}>
                  <option value="">Stok kalemi seç...</option>
                  {stoklar.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} (mevcut: {s.miktar} {s.birim})</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs mb-1" style={{ color: "var(--text-muted)" }}>Miktar / sipariş</label>
                    <input type="number" min="0.01" step="0.01" value={secMiktar}
                      onChange={(e) => setSecMiktar(e.target.value)} className={`${inputCls} w-full`} />
                  </div>
                  <button onClick={addLink} disabled={!secStok} className="btn-primary self-end text-xs px-4 disabled:opacity-40">Ekle</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kategori Yönetimi paneli */}
      <div className="card p-5">
        <button
          className="flex items-center gap-2 w-full text-left"
          onClick={() => setKatPanel((p) => !p)}
        >
          <Tags size={15} style={{ color: "var(--text-muted)" }} />
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text)" }}>
            Kategori Yönetimi
          </span>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
            {kategoriler.length} kategori
          </span>
          <span style={{ color: "var(--text-muted)" }}>{katPanel ? "▲" : "▼"}</span>
        </button>

        {katPanel && (
          <div className="mt-4 space-y-3">
            {/* Mevcut kategoriler */}
            <div className="space-y-2">
              {kategoriler.map((kat, idx) => (
                <div key={kat} className="flex items-center gap-2 p-3 rounded-xl"
                  style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}>
                  {/* Sıra butonları */}
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveKat(idx, -1)} disabled={idx === 0} className="disabled:opacity-20 hover:opacity-70">
                      <ChevronUp size={12} style={{ color: "var(--text-muted)" }} />
                    </button>
                    <button onClick={() => moveKat(idx, 1)} disabled={idx === kategoriler.length - 1} className="disabled:opacity-20 hover:opacity-70">
                      <ChevronDown size={12} style={{ color: "var(--text-muted)" }} />
                    </button>
                  </div>

                  {/* İsim / düzenleme */}
                  {editKat === kat ? (
                    <input
                      autoFocus
                      value={editKatVal}
                      onChange={(e) => setEditKatVal(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") renameKat(kat); if (e.key === "Escape") setEditKat(null); }}
                      className={`${inputCls} flex-1 py-1 text-sm`}
                    />
                  ) : (
                    <span className="flex-1 text-sm font-medium" style={{ color: "var(--text)" }}>{kat}</span>
                  )}

                  {/* Öğe sayısı */}
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {(grouped[kat] ?? []).length} öğe
                  </span>

                  {/* Aksiyonlar */}
                  {editKat === kat ? (
                    <div className="flex gap-1">
                      <button onClick={() => renameKat(kat)} disabled={katLoading}
                        className="p-1 rounded hover:bg-green-500/10 transition-colors">
                        <Check size={14} style={{ color: "#22c55e" }} />
                      </button>
                      <button onClick={() => setEditKat(null)}
                        className="p-1 rounded hover:bg-red-500/10 transition-colors">
                        <X size={14} style={{ color: "#ef4444" }} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditKat(kat); setEditKatVal(kat); }}
                        className="p-1 rounded hover:bg-white/5 transition-colors"
                        title="Yeniden adlandır">
                        <Pencil size={13} style={{ color: "var(--text-muted)" }} />
                      </button>
                      <button
                        onClick={() => deleteKat(kat)}
                        disabled={katLoading}
                        className="p-1 rounded hover:bg-red-500/10 transition-colors disabled:opacity-40"
                        title="Sil">
                        <Trash2 size={13} style={{ color: "var(--text-muted)" }} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Yeni kategori ekle */}
            <div className="flex gap-2 pt-1">
              <input
                value={yeniKat}
                onChange={(e) => setYeniKat(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addKat(); }}
                placeholder="Yeni kategori adı..."
                className={`${inputCls} flex-1 text-sm`}
              />
              <button onClick={addKat} disabled={katLoading || !yeniKat.trim()} className="btn-primary text-xs px-4 disabled:opacity-40 flex items-center gap-1">
                <Plus size={13} /> Ekle
              </button>
            </div>
          </div>
        )}
      </div>

      {/* İçerik: Form + Liste */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Ekleme formu */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="font-semibold mb-4 uppercase tracking-wider text-sm" style={{ color: "var(--text)" }}>Yeni Öğe Ekle</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-xs mb-1 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Kategori</label>
                <select name="category" value={form.category} onChange={handleChange} className={inputCls}>
                  {kategoriler.map((c) => <option key={c}>{c}</option>)}
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
                <input name="happyHourPrice" value={form.happyHourPrice} onChange={handleChange} className={inputCls} placeholder="₺180 (boş = happy hour yok)" />
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
          {kategoriler.map((cat) => (
            <div key={cat} className="card p-6">
              <h2 className="font-semibold mb-4 uppercase tracking-wider text-sm" style={{ color: "var(--text)" }}>{cat}</h2>
              {(grouped[cat] ?? []).length === 0 ? (
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
                        <button onClick={() => toggleActive(item.id, item.active)}
                          className={item.active ? "badge badge-green" : "badge"}>
                          {item.active ? "Aktif" : "Pasif"}
                        </button>
                        <button onClick={() => setStokModal(item)} title="Stok bağlantıları"
                          className="p-1 rounded transition-colors hover:bg-white/5">
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

          {/* Kategorisiz öğeler */}
          {uncategorized.length > 0 && (
            <div className="card p-6" style={{ borderColor: "#F59E0B" }}>
              <h2 className="font-semibold mb-4 uppercase tracking-wider text-sm" style={{ color: "#F59E0B" }}>
                ⚠ Kategorisiz Öğeler
              </h2>
              <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                Bu öğelerin kategorisi silinmiş veya değiştirilmiş. Yeni bir kategori seçin ya da silin.
              </p>
              <div className="space-y-2">
                {uncategorized.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg"
                    style={{ border: "1px solid #F59E0B33" }}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" style={{ color: "var(--text)" }}>{item.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>Kategori: {item.category}</p>
                    </div>
                    <button onClick={() => deleteItem(item.id)}
                      className="text-xs px-1 transition-colors hover:text-red-400"
                      style={{ color: "var(--text-muted)" }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
