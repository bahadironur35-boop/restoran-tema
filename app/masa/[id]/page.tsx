"use client";
import { useState, useEffect, use } from "react";

type MenuItem = { id: number; name: string; desc: string; price: string; category: string };

const categories = ["Başlangıçlar", "Ana Yemekler", "Tatlılar", "İçecekler"];

export default function MasaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState("menu");
  const [talep, setTalep] = useState<"garson" | "hesap" | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/menu-public").then((r) => r.json()).then(setMenu);
  }, []);

  const sendTalep = async (tip: "garson" | "hesap") => {
    setLoading(true);
    setTalep(tip);
    await fetch("/api/masa-talep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masaId: Number(id), tip }),
    });
    setSent(tip);
    setLoading(false);
    setTimeout(() => setSent(null), 5000);
  };

  const grouped = categories.reduce<Record<string, MenuItem[]>>((acc, cat) => {
    acc[cat] = menu.filter((m) => m.category === cat);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/90 backdrop-blur border-b border-[#2A2A2A] px-4 py-4 flex items-center justify-between">
        <div>
          <p className="text-[#C9A84C] font-bold tracking-widest uppercase text-sm">La Maison</p>
          <p className="text-gray-500 text-xs">Masa {id}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("menu")}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === "menu" ? "bg-[#C9A84C] text-black" : "bg-[#1A1A1A] text-gray-400 border border-[#2A2A2A]"}`}
          >
            Menü
          </button>
          <button
            onClick={() => setActiveTab("cagir")}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === "cagir" ? "bg-[#C9A84C] text-black" : "bg-[#1A1A1A] text-gray-400 border border-[#2A2A2A]"}`}
          >
            Çağır
          </button>
        </div>
      </header>

      {/* Menu Tab */}
      {activeTab === "menu" && (
        <div className="px-4 py-6 max-w-lg mx-auto">
          {categories.map((cat) =>
            grouped[cat]?.length > 0 ? (
              <div key={cat} className="mb-8">
                <h2 className="text-[#C9A84C] uppercase tracking-widest text-xs font-bold mb-4 border-b border-[#2A2A2A] pb-2">
                  {cat}
                </h2>
                <div className="space-y-3">
                  {grouped[cat].map((item) => (
                    <div key={item.id} className="flex justify-between gap-3 py-3 border-b border-[#1A1A1A]">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                      </div>
                      <span className="text-[#C9A84C] font-bold text-sm whitespace-nowrap">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )}
          {menu.length === 0 && (
            <p className="text-gray-500 text-center py-12">Menü yükleniyor...</p>
          )}
        </div>
      )}

      {/* Çağır Tab */}
      {activeTab === "cagir" && (
        <div className="px-4 py-12 max-w-sm mx-auto">
          <p className="text-center text-gray-400 text-sm mb-10">
            Aşağıdaki butonları kullanarak garsonumuzu çağırabilirsiniz.
          </p>

          {sent && (
            <div className="bg-green-900/30 border border-green-700 text-green-400 text-center py-4 mb-6 text-sm">
              ✓ {sent === "garson" ? "Garsonunuz geliyor..." : "Hesabınız hazırlanıyor..."}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => sendTalep("garson")}
              disabled={loading || !!sent}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#C9A84C] transition-colors py-6 flex flex-col items-center gap-2 disabled:opacity-50"
            >
              <span className="text-4xl">🙋</span>
              <span className="font-semibold tracking-wider uppercase text-sm">Garson Çağır</span>
              <span className="text-gray-500 text-xs">Garsonunuz kısa sürede gelecek</span>
            </button>

            <button
              onClick={() => sendTalep("hesap")}
              disabled={loading || !!sent}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#C9A84C] transition-colors py-6 flex flex-col items-center gap-2 disabled:opacity-50"
            >
              <span className="text-4xl">🧾</span>
              <span className="font-semibold tracking-wider uppercase text-sm">Hesap İstiyorum</span>
              <span className="text-gray-500 text-xs">Hesabınız hazırlanacak</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
