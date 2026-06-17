"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type MenuItem = {
  id: number;
  name: string;
  desc: string;
  price: string;
  category: string;
  active: boolean;
  order: number;
};

const emptyForm = { name: "", desc: "", price: "", category: "Başlangıçlar" };
const categories = ["Başlangıçlar", "Ana Yemekler", "Tatlılar", "İçecekler"];

export default function MenuYonetim({ items }: { items: MenuItem[] }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(emptyForm);
    setLoading(false);
    router.refresh();
  };

  const toggleActive = async (id: number, active: boolean) => {
    await fetch(`/api/admin/menu/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
  };

  const deleteItem = async (id: number) => {
    if (!confirm("Bu menü öğesini silmek istediğinizden emin misiniz?")) return;
    await fetch(`/api/admin/menu/${id}`, { method: "DELETE" });
    router.refresh();
  };

  const grouped = categories.reduce<Record<string, MenuItem[]>>((acc, cat) => {
    acc[cat] = items.filter((i) => i.category === cat);
    return acc;
  }, {});

  const inputCls = "w-full bg-[#0F0F0F] border border-[#2A2A2A] text-white px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Add form */}
      <div className="lg:col-span-1">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6">
          <h2 className="font-semibold mb-4 text-[#C9A84C] uppercase tracking-wider text-sm">Yeni Öğe Ekle</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Kategori</label>
              <select name="category" value={form.category} onChange={handleChange} className={inputCls}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Adı *</label>
              <input name="name" value={form.name} onChange={handleChange} required className={inputCls} placeholder="Wagyu Biftek" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Açıklama *</label>
              <textarea name="desc" value={form.desc} onChange={handleChange} required rows={2} className={inputCls} placeholder="Malzemeler..." />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Fiyat *</label>
              <input name="price" value={form.price} onChange={handleChange} required className={inputCls} placeholder="₺250" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full text-xs tracking-widest uppercase">
              {loading ? "Ekleniyor..." : "Ekle"}
            </button>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-2 space-y-6">
        {categories.map((cat) => (
          <div key={cat} className="bg-[#1A1A1A] border border-[#2A2A2A] p-6">
            <h2 className="font-semibold mb-4 text-[#C9A84C] uppercase tracking-wider text-sm">{cat}</h2>
            {grouped[cat].length === 0 ? (
              <p className="text-gray-600 text-sm">Bu kategoride öğe yok.</p>
            ) : (
              <div className="space-y-2">
                {grouped[cat].map((item) => (
                  <div key={item.id} className={`flex items-center justify-between p-3 border border-[#2A2A2A] ${!item.active ? "opacity-40" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-gray-500 text-xs truncate">{item.desc}</p>
                    </div>
                    <span className="text-[#C9A84C] text-sm font-bold mx-4 whitespace-nowrap">{item.price}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(item.id, item.active)}
                        className={`px-2 py-1 text-xs font-semibold transition-colors ${
                          item.active ? "bg-green-900/40 text-green-400 hover:bg-green-900/60" : "bg-gray-800 text-gray-500 hover:bg-gray-700"
                        }`}
                      >
                        {item.active ? "Aktif" : "Pasif"}
                      </button>
                      <button onClick={() => deleteItem(item.id)} className="text-xs text-gray-600 hover:text-red-400 transition-colors px-1">✕</button>
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
