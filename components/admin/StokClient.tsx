"use client";
import { useState, useEffect } from "react";

type StokItem = {
  id: number; name: string; birim: string; miktar: number;
  minMiktar: number; kategori: string;
  hareketler: { id: number; tip: string; miktar: number; aciklama: string | null; createdAt: string }[];
};

const kategoriler = ["Malzeme", "İçecek", "Ambalaj", "Temizlik"];
const birimler = ["adet", "kg", "gr", "litre", "ml"];

const emptyForm = { name: "", birim: "adet", miktar: "", minMiktar: "5", kategori: "Malzeme" };

export default function StokClient() {
  const [items, setItems] = useState<StokItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [filterKat, setFilterKat] = useState("hepsi");
  const [filterDurum, setFilterDurum] = useState("hepsi");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<StokItem | null>(null);
  const [hareketForm, setHareketForm] = useState({ tip: "giris", miktar: "", aciklama: "" });
  const [hareketLoading, setHareketLoading] = useState(false);

  const fetchItems = () =>
    fetch("/api/admin/stok").then((r) => r.json()).then(setItems);

  useEffect(() => { fetchItems(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/stok", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(emptyForm);
    setLoading(false);
    fetchItems();
  };

  const handleHareket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setHareketLoading(true);
    const res = await fetch(`/api/admin/stok/${selected.id}/hareket`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hareketForm),
    });
    const updated = await res.json();
    setSelected(updated);
    setHareketForm({ tip: "giris", miktar: "", aciklama: "" });
    setHareketLoading(false);
    fetchItems();
  };

  const deleteItem = async (id: number) => {
    if (!confirm("Bu stok öğesini silmek istiyor musunuz?")) return;
    await fetch(`/api/admin/stok/${id}`, { method: "DELETE" });
    if (selected?.id === id) setSelected(null);
    fetchItems();
  };

  const kritikler = items.filter((i) => i.miktar <= i.minMiktar);

  const filtered = items.filter((i) => {
    const katMatch = filterKat === "hepsi" || i.kategori === filterKat;
    const durumMatch = filterDurum === "hepsi"
      ? true : filterDurum === "kritik"
      ? i.miktar <= i.minMiktar : i.miktar > i.minMiktar;
    return katMatch && durumMatch;
  });

  const stokBar = (item: StokItem) => {
    const pct = Math.min((item.miktar / (item.minMiktar * 3)) * 100, 100);
    const color = item.miktar <= item.minMiktar ? "bg-red-500" : item.miktar <= item.minMiktar * 1.5 ? "bg-yellow-500" : "bg-green-500";
    return { pct, color };
  };

  const inputCls = "w-full bg-[#0F0F0F] border border-[#2A2A2A] text-white px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors";

  return (
    <div className="space-y-6">
      {/* Kritik stok uyarısı */}
      {kritikler.length > 0 && (
        <div className="bg-red-900/20 border border-red-700 p-4 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-400 text-sm">Kritik Stok Uyarısı — {kritikler.length} ürün</p>
            <p className="text-red-300 text-sm">{kritikler.map((i) => `${i.name} (${i.miktar} ${i.birim})`).join(" · ")}</p>
          </div>
        </div>
      )}

      {/* Özet */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Toplam Ürün", value: items.length, color: "text-white" },
          { label: "Kritik Stok", value: kritikler.length, color: "text-red-400" },
          { label: "Normal Stok", value: items.filter((i) => i.miktar > i.minMiktar).length, color: "text-green-400" },
          { label: "Bugün Hareket", value: items.flatMap((i) => i.hareketler).filter((h) => new Date(h.createdAt).toDateString() === new Date().toDateString()).length, color: "text-[#C9A84C]" },
        ].map((s) => (
          <div key={s.label} className="bg-[#1A1A1A] border border-[#2A2A2A] p-5">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-gray-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol: Form + Hareket */}
        <div className="space-y-4">
          {/* Yeni stok ürünü */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-5">
            <h2 className="text-[#C9A84C] uppercase tracking-wider text-sm font-semibold mb-4">Yeni Ürün Ekle</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Ürün Adı *</label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required className={inputCls} placeholder="Dana Eti" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Birim</label>
                  <select value={form.birim} onChange={(e) => setForm((p) => ({ ...p, birim: e.target.value }))} className={inputCls}>
                    {birimler.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Kategori</label>
                  <select value={form.kategori} onChange={(e) => setForm((p) => ({ ...p, kategori: e.target.value }))} className={inputCls}>
                    {kategoriler.map((k) => <option key={k}>{k}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Başlangıç</label>
                  <input type="number" min="0" step="0.1" value={form.miktar} onChange={(e) => setForm((p) => ({ ...p, miktar: e.target.value }))} className={inputCls} placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Min. Stok</label>
                  <input type="number" min="0" step="0.1" value={form.minMiktar} onChange={(e) => setForm((p) => ({ ...p, minMiktar: e.target.value }))} className={inputCls} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full text-xs tracking-widest uppercase">
                {loading ? "Ekleniyor..." : "Ekle"}
              </button>
            </form>
          </div>

          {/* Seçili ürün hareketi */}
          {selected && (
            <div className="bg-[#1A1A1A] border border-[#C9A84C]/40 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[#C9A84C] uppercase tracking-wider text-sm font-semibold">{selected.name}</h2>
                <button onClick={() => setSelected(null)} className="text-gray-600 hover:text-gray-400 text-xs">✕ Kapat</button>
              </div>
              <p className="text-2xl font-bold mb-1">{selected.miktar} <span className="text-gray-500 text-base font-normal">{selected.birim}</span></p>
              <p className="text-gray-500 text-xs mb-4">Min: {selected.minMiktar} {selected.birim}</p>

              <form onSubmit={handleHareket} className="space-y-3">
                <div className="flex gap-2">
                  {["giris", "cikis"].map((t) => (
                    <button key={t} type="button" onClick={() => setHareketForm((p) => ({ ...p, tip: t }))}
                      className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${hareketForm.tip === t ? (t === "giris" ? "bg-green-700 text-white" : "bg-red-700 text-white") : "bg-[#0F0F0F] border border-[#2A2A2A] text-gray-500"}`}>
                      {t === "giris" ? "▲ Giriş" : "▼ Çıkış"}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Miktar *</label>
                  <input type="number" min="0.1" step="0.1" value={hareketForm.miktar} onChange={(e) => setHareketForm((p) => ({ ...p, miktar: e.target.value }))} required className={inputCls} placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Açıklama</label>
                  <input value={hareketForm.aciklama} onChange={(e) => setHareketForm((p) => ({ ...p, aciklama: e.target.value }))} className={inputCls} placeholder="Tedarikçi, fire, kullanım..." />
                </div>
                <button type="submit" disabled={hareketLoading} className={`w-full py-2 text-xs font-bold uppercase tracking-wider transition-colors ${hareketForm.tip === "giris" ? "bg-green-700 hover:bg-green-600 text-white" : "bg-red-700 hover:bg-red-600 text-white"}`}>
                  {hareketLoading ? "Kaydediliyor..." : hareketForm.tip === "giris" ? "▲ Stok Ekle" : "▼ Stok Düş"}
                </button>
              </form>

              {/* Son hareketler */}
              {selected.hareketler.length > 0 && (
                <div className="mt-4 space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Son Hareketler</p>
                  {selected.hareketler.slice(0, 5).map((h) => (
                    <div key={h.id} className="flex items-center justify-between text-xs py-1 border-b border-[#2A2A2A] last:border-0">
                      <span className={h.tip === "giris" ? "text-green-400" : "text-red-400"}>
                        {h.tip === "giris" ? "▲" : "▼"} {h.miktar} {selected.birim}
                      </span>
                      <span className="text-gray-600">{h.aciklama || "—"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sağ: Stok listesi */}
        <div className="lg:col-span-2">
          {/* Filtreler */}
          <div className="flex flex-wrap gap-2 mb-4">
            <select value={filterKat} onChange={(e) => setFilterKat(e.target.value)}
              className="bg-[#1A1A1A] border border-[#2A2A2A] text-gray-400 px-3 py-1.5 text-xs focus:outline-none focus:border-[#C9A84C] transition-colors">
              <option value="hepsi">Tüm Kategoriler</option>
              {kategoriler.map((k) => <option key={k}>{k}</option>)}
            </select>
            {["hepsi", "kritik", "normal"].map((d) => (
              <button key={d} onClick={() => setFilterDurum(d)}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider font-semibold transition-colors ${filterDurum === d ? "bg-[#C9A84C] text-black" : "bg-[#1A1A1A] border border-[#2A2A2A] text-gray-400 hover:text-white"}`}>
                {d === "hepsi" ? "Hepsi" : d === "kritik" ? "⚠ Kritik" : "✓ Normal"}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-10 text-center text-gray-500">
              {items.length === 0 ? "Henüz stok ürünü eklenmedi." : "Bu filtreyle eşleşen ürün yok."}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((item) => {
                const { pct, color } = stokBar(item);
                const isKritik = item.miktar <= item.minMiktar;
                const isSelected = selected?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelected(isSelected ? null : item)}
                    className={`bg-[#1A1A1A] border p-4 cursor-pointer transition-colors ${isSelected ? "border-[#C9A84C]" : isKritik ? "border-red-800 hover:border-red-600" : "border-[#2A2A2A] hover:border-gray-600"}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isKritik && <span className="text-red-400 text-xs">⚠</span>}
                        <p className="font-medium text-sm">{item.name}</p>
                        <span className="text-gray-600 text-xs bg-[#0F0F0F] px-1.5 py-0.5">{item.kategori}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold text-sm ${isKritik ? "text-red-400" : "text-white"}`}>
                          {item.miktar} <span className="text-gray-500 font-normal text-xs">{item.birim}</span>
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                          className="text-gray-700 hover:text-red-400 transition-colors text-xs px-1"
                        >✕</button>
                      </div>
                    </div>

                    {/* Stok bar */}
                    <div className="h-1.5 bg-[#0F0F0F] rounded-full overflow-hidden">
                      <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-gray-600 text-xs mt-1">Min: {item.minMiktar} {item.birim}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
