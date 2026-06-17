"use client";
import { useState, useEffect } from "react";

type MenuItem = { id: number; name: string; price: string; category: string; desc: string };
type Masa = { id: number; no: number; kapasite: number };
type SepetItem = { menuItemId: number; name: string; price: string; adet: number; not: string };

const categories = ["Başlangıçlar", "Ana Yemekler", "Tatlılar", "İçecekler"];

export default function PosClient() {
  const [masalar, setMasalar] = useState<Masa[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [selectedMasa, setSelectedMasa] = useState<Masa | null>(null);
  const [sepet, setSepet] = useState<SepetItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("Ana Yemekler");
  const [notlar, setNotlar] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch("/api/admin/masalar").then((r) => r.json()).then(setMasalar);
    fetch("/api/menu-public").then((r) => r.json()).then(setMenu);
  }, []);

  const addToSepet = (item: MenuItem) => {
    setSepet((prev) => {
      const existing = prev.find((s) => s.menuItemId === item.id);
      if (existing) return prev.map((s) => s.menuItemId === item.id ? { ...s, adet: s.adet + 1 } : s);
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, adet: 1, not: "" }];
    });
  };

  const removeFromSepet = (menuItemId: number) => {
    setSepet((prev) => {
      const existing = prev.find((s) => s.menuItemId === menuItemId);
      if (existing && existing.adet > 1) return prev.map((s) => s.menuItemId === menuItemId ? { ...s, adet: s.adet - 1 } : s);
      return prev.filter((s) => s.menuItemId !== menuItemId);
    });
  };

  const priceNum = (price: string) => Number(price.replace(/[^\d]/g, ""));

  const toplam = sepet.reduce((sum, s) => sum + priceNum(s.price) * s.adet, 0);

  const sendOrder = async () => {
    if (!selectedMasa || sepet.length === 0) return;
    setSending(true);
    await fetch("/api/admin/siparis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masaId: selectedMasa.id, items: sepet, notlar }),
    });
    setSent(true);
    setSepet([]);
    setNotlar("");
    setSending(false);
    setTimeout(() => setSent(false), 3000);
  };

  const filteredMenu = menu.filter((m) => m.category === activeCategory);
  const inputCls = "bg-[#0F0F0F] border border-[#2A2A2A] text-white px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

      {/* Sol: Masa seç + Menü */}
      <div className="lg:col-span-2 space-y-4">
        {/* Masa seçimi */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Masa Seç</p>
          <div className="flex flex-wrap gap-2">
            {masalar.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMasa(m)}
                className={`w-14 h-14 font-bold text-lg transition-colors ${selectedMasa?.id === m.id ? "bg-[#C9A84C] text-black" : "bg-[#0F0F0F] border border-[#2A2A2A] text-white hover:border-[#C9A84C]"}`}
              >
                {m.no}
              </button>
            ))}
            {masalar.length === 0 && <p className="text-gray-600 text-sm">Önce masa ekleyin.</p>}
          </div>
        </div>

        {/* Kategori tabs */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${activeCategory === cat ? "bg-[#C9A84C] text-black" : "bg-[#1A1A1A] border border-[#2A2A2A] text-gray-400 hover:text-white"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menü grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filteredMenu.map((item) => {
            const inSepet = sepet.find((s) => s.menuItemId === item.id);
            return (
              <button
                key={item.id}
                onClick={() => addToSepet(item)}
                className={`bg-[#1A1A1A] border p-4 text-left transition-colors hover:border-[#C9A84C] ${inSepet ? "border-[#C9A84C]" : "border-[#2A2A2A]"}`}
              >
                <p className="font-medium text-sm mb-1">{item.name}</p>
                <p className="text-gray-500 text-xs mb-2 line-clamp-1">{item.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#C9A84C] font-bold text-sm">{item.price}</span>
                  {inSepet && <span className="bg-[#C9A84C] text-black text-xs font-bold w-5 h-5 flex items-center justify-center">{inSepet.adet}</span>}
                </div>
              </button>
            );
          })}
          {filteredMenu.length === 0 && (
            <div className="col-span-3 text-center text-gray-600 text-sm py-8">Bu kategoride menü öğesi yok.</div>
          )}
        </div>
      </div>

      {/* Sağ: Sepet */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-5 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#C9A84C] uppercase tracking-wider text-sm">
            {selectedMasa ? `Masa ${selectedMasa.no} — Sipariş` : "Sipariş"}
          </h2>
          {sepet.length > 0 && (
            <button onClick={() => setSepet([])} className="text-xs text-gray-600 hover:text-red-400 transition-colors">Temizle</button>
          )}
        </div>

        {sepet.length === 0 ? (
          <p className="text-gray-600 text-sm flex-1 flex items-center justify-center">Menüden ekleyin</p>
        ) : (
          <div className="flex-1 space-y-2 overflow-y-auto mb-4">
            {sepet.map((s) => (
              <div key={s.menuItemId} className="flex items-center gap-2 p-2 border border-[#2A2A2A]">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  <p className="text-xs text-[#C9A84C]">{s.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => removeFromSepet(s.menuItemId)} className="w-6 h-6 bg-[#0F0F0F] border border-[#2A2A2A] text-white text-sm hover:border-red-500 transition-colors">−</button>
                  <span className="w-5 text-center text-sm font-bold">{s.adet}</span>
                  <button onClick={() => addToSepet({ id: s.menuItemId, name: s.name, price: s.price, category: "", desc: "" })} className="w-6 h-6 bg-[#0F0F0F] border border-[#2A2A2A] text-white text-sm hover:border-[#C9A84C] transition-colors">+</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {sepet.length > 0 && (
          <>
            <textarea
              value={notlar}
              onChange={(e) => setNotlar(e.target.value)}
              placeholder="Not (isteğe bağlı)..."
              rows={2}
              className={`${inputCls} w-full mb-4 resize-none`}
            />
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm">Toplam</span>
              <span className="text-[#C9A84C] font-bold text-lg">₺{toplam.toLocaleString("tr-TR")}</span>
            </div>
          </>
        )}

        {sent && (
          <div className="bg-green-900/30 border border-green-700 text-green-400 text-center py-2 text-sm mb-3">
            ✓ Mutfağa gönderildi!
          </div>
        )}

        <button
          onClick={sendOrder}
          disabled={!selectedMasa || sepet.length === 0 || sending}
          className="btn-primary w-full text-sm tracking-widest uppercase disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {sending ? "Gönderiliyor..." : "Mutfağa Gönder"}
        </button>
      </div>
    </div>
  );
}
