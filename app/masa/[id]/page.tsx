"use client";
import { useState, useEffect, use } from "react";
import { ShoppingCart, Plus, Minus, Trash2, ChevronRight } from "lucide-react";

type MenuItem = { id: number; name: string; desc: string; price: string; category: string; image?: string | null; happyHourPrice?: string | null };
type MasaInfo = { no: number; alan: string; kapasite: number } | null;
type CartItem = { menuItemId: number; name: string; price: string; adet: number; not: string };

const CATEGORIES = ["Başlangıçlar", "Ana Yemekler", "Tatlılar", "İçecekler"];

type Tab = "menu" | "sepet" | "cagir";

export default function MasaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [masaInfo, setMasaInfo] = useState<MasaInfo>(null);
  const [activeTab, setActiveTab] = useState<Tab>("menu");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notlar, setNotlar] = useState("");
  const [sending, setSending] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const [hasOrdered, setHasOrdered] = useState(false);
  const [talepSent, setTalepSent] = useState<string | null>(null);
  const [talepLoading, setTalepLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [siparisHazir, setSiparisHazir] = useState(false);
  const [qrAktif, setQrAktif] = useState(true);
  const [talepAktif, setTalepAktif] = useState(true);
  const [fiyatGoster, setFiyatGoster] = useState(true);
  const [notAktif, setNotAktif] = useState(true);
  const [tema, setTema] = useState({
    restaurantName: "EatOs",
    brandColor: "#C9A84C",
    brandColorDark: "#0F0F0F",
    brandTextLight: "#FFFFFF",
    logoUrl: "",
    logoPozisyon: "orta",
    happyHourBaslangic: "",
    happyHourBitis: "",
    happyHourEtiket: "Happy Hour",
  });

  // Şu an happy hour aralığında mı?
  const isHappyHour = (() => {
    if (!tema.happyHourBaslangic || !tema.happyHourBitis) return false;
    const now = new Date();
    const [sh, sm] = tema.happyHourBaslangic.split(":").map(Number);
    const [eh, em] = tema.happyHourBitis.split(":").map(Number);
    const cur = now.getHours() * 60 + now.getMinutes();
    return cur >= sh * 60 + sm && cur < eh * 60 + em;
  })();

  useEffect(() => {
    fetch("/api/menu-public").then((r) => r.json()).then(setMenu);
    fetch("/api/admin/ayarlar").then((r) => r.json()).then((data) => {
      if (data.qrSiparisAktif === "false") setQrAktif(false);
      if (data.qrMasaTalebiAktif === "false") setTalepAktif(false);
      if (data.qrFiyatGoster === "false") setFiyatGoster(false);
      if (data.qrSiparisNotuAktif === "false") setNotAktif(false);
    });
    fetch("/api/tema").then((r) => r.json()).then((t) => setTema((p) => ({ ...p, ...t })));
    fetch("/api/admin/masalar").then((r) => r.json()).then((data) => {
      const found = data.find((m: { id: number; no: number; alan: string; kapasite: number }) => m.id === Number(id));
      if (found) setMasaInfo({ no: found.no, alan: found.alan, kapasite: found.kapasite });
    });
  }, [id]);

  // Sipariş hazır bildirimi — SSE ile anlık
  useEffect(() => {
    const es = new EventSource("/api/events?scope=siparisler");
    es.addEventListener("update", (e) => {
      try {
        const { siparisler } = JSON.parse(e.data) as { siparisler: { masaId: number | null; durum: string }[] };
        if (!siparisler) return;
        const hazir = siparisler.some((s) => s.masaId === Number(id) && s.durum === "hazir");
        setSiparisHazir(hazir);
      } catch { /* ignore */ }
    });
    return () => es.close();
  }, [id]);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id);
      if (existing) return prev.map((c) => c.menuItemId === item.id ? { ...c, adet: c.adet + 1 } : c);
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, adet: 1, not: "" }];
    });
  };

  const removeFromCart = (menuItemId: number) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === menuItemId);
      if (existing && existing.adet > 1) return prev.map((c) => c.menuItemId === menuItemId ? { ...c, adet: c.adet - 1 } : c);
      return prev.filter((c) => c.menuItemId !== menuItemId);
    });
  };

  const deleteFromCart = (menuItemId: number) => setCart((prev) => prev.filter((c) => c.menuItemId !== menuItemId));

  const updateNot = (menuItemId: number, not: string) =>
    setCart((prev) => prev.map((c) => c.menuItemId === menuItemId ? { ...c, not } : c));

  const cartCount = cart.reduce((s, c) => s + c.adet, 0);

  const parsePrice = (p: string) => parseFloat(p.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
  const cartTotal = cart.reduce((s, c) => s + parsePrice(c.price) * c.adet, 0);

  const sendOrder = async () => {
    if (!cart.length) return;
    setSending(true);
    await fetch("/api/masa-siparis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masaId: Number(id), items: cart, notlar }),
    });
    setCart([]);
    setNotlar("");
    setOrderSent(true);
    setHasOrdered(true);
    setSending(false);
    setTimeout(() => { setOrderSent(false); setActiveTab("menu"); }, 4000);
  };

  const sendTalep = async (tip: "garson" | "hesap") => {
    setTalepLoading(true);
    await fetch("/api/masa-talep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masaId: Number(id), tip }),
    });
    setTalepSent(tip);
    setTalepLoading(false);
    setTimeout(() => setTalepSent(null), 5000);
  };

  const grouped = CATEGORIES.reduce<Record<string, MenuItem[]>>((acc, cat) => {
    acc[cat] = menu.filter((m) => m.category === cat);
    return acc;
  }, {});

  const visibleCategories = CATEGORIES.filter((c) => grouped[c]?.length > 0);

  const BC  = tema.brandColor;
  const BG  = tema.brandColorDark;
  const TL  = tema.brandTextLight;

  return (
    <div className="min-h-screen text-white flex flex-col" style={{ backgroundColor: BG }}>

      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: BG + "F2" }}>
        <div style={{ flex: 1, textAlign: tema.logoPozisyon === "orta" && !tema.logoUrl ? "center" : "left" }}>
          {tema.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tema.logoUrl} alt={tema.restaurantName} className="h-7 object-contain"
              style={{ margin: tema.logoPozisyon === "orta" ? "0 auto" : "0" }} />
          ) : (
            <p className="font-bold tracking-widest uppercase text-sm" style={{ color: BC }}>{tema.restaurantName}</p>
          )}
          <p className="text-gray-500 text-xs" style={{ textAlign: "left" }}>
            {masaInfo ? `${masaInfo.alan} · Masa ${masaInfo.no}` : `Masa ${id}`}
          </p>
        </div>
        {qrAktif && (
          <button
            onClick={() => setActiveTab("sepet")}
            className="relative p-2"
          >
            <ShoppingCart size={22} className="text-gray-300" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                style={{ backgroundColor: BC, color: BG }}>
                {cartCount}
              </span>
            )}
          </button>
        )}
      </header>

      {/* Sipariş hazır bildirimi */}
      {siparisHazir && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-semibold"
          style={{ backgroundColor: "#16A34A", color: "#fff" }}>
          <span>🍽️ Siparişiniz hazır! Servis edilecek.</span>
          <button onClick={() => setSiparisHazir(false)} className="opacity-70 hover:opacity-100 text-lg leading-none">×</button>
        </div>
      )}

      {/* Tab bar */}
      <div className="sticky top-[57px] z-10 border-b border-white/10 flex" style={{ backgroundColor: BG }}>
        {(["menu", ...(qrAktif ? ["sepet"] : []), ...(talepAktif ? ["cagir"] : [])] as Tab[]).map((tab) => {
          const labels: Record<Tab, string> = { menu: "Menü", sepet: hasOrdered ? `Siparişe Ekle${cartCount > 0 ? ` (${cartCount})` : ""}` : `Sipariş Ver${cartCount > 0 ? ` (${cartCount})` : ""}`, cagir: "Çağır" };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors"
              style={activeTab === tab
                ? { color: BC, borderBottom: `2px solid ${BC}` }
                : { color: "#555" }}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* QR sipariş kapalı banner */}
      {!qrAktif && (
        <div className="px-4 py-3 text-xs text-center" style={{ backgroundColor: "#1A1A1A", color: "#888" }}>
          Sipariş için lütfen garsonumuzu çağırın
        </div>
      )}

      {/* Happy Hour banner */}
      {isHappyHour && (
        <div className="px-4 py-2 text-xs text-center font-semibold" style={{ backgroundColor: "#78350F", color: "#FCD34D" }}>
          ⚡ {tema.happyHourEtiket || "Happy Hour"} — İndirimli fiyatlar aktif!
        </div>
      )}

      {/* MENÜ TAB */}
      {activeTab === "menu" && (
        <div className="flex-1 flex flex-col">
          {/* Kategori scroll */}
          <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b border-[#1A1A1A] scrollbar-hide">
            {visibleCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="whitespace-nowrap px-3 py-1.5 text-xs font-semibold rounded-full transition-colors flex-shrink-0"
                style={activeCategory === cat
                  ? { backgroundColor: BC, color: BG }
                  : { backgroundColor: "#1A1A1A", color: "#888", border: "1px solid #2A2A2A" }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Ürünler */}
          <div className="flex-1 px-4 py-4 space-y-3 max-w-lg mx-auto w-full">
            {(grouped[activeCategory] ?? []).map((item) => {
              const inCart = cart.find((c) => c.menuItemId === item.id);
              return (
                <div key={item.id} className="flex items-center gap-3 py-3 border-b border-[#1A1A1A]">
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-white">{item.name}</p>
                    {item.desc && <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{item.desc}</p>}
                    {fiyatGoster && (
                      <div className="flex items-center gap-2 mt-1">
                        {isHappyHour && item.happyHourPrice ? (
                          <>
                            <p className="font-bold text-sm" style={{ color: "#F59E0B" }}>
                              ⚡ {item.happyHourPrice}
                            </p>
                            <p className="text-xs line-through" style={{ color: "var(--text-muted)" }}>{item.price}</p>
                          </>
                        ) : (
                          <p className="text-brand font-bold text-sm">{item.price}</p>
                        )}
                      </div>
                    )}
                  </div>
                  {qrAktif && (inCart ? (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "#2A2A2A" }}>
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center font-bold text-sm">{inCart.adet}</span>
                      <button onClick={() => addToCart(item)}
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: BC, color: BG }}>
                        <Plus size={12} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(item)}
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: BC, color: BG }}>
                      <Plus size={15} />
                    </button>
                  ))}
                </div>
              );
            })}
            {(grouped[activeCategory] ?? []).length === 0 && (
              <p className="text-gray-600 text-center py-12">Bu kategoride ürün yok.</p>
            )}
          </div>

          {/* Sepete git butonu */}
          {cartCount > 0 && (
            <div className="sticky bottom-0 p-4 border-t border-white/10" style={{ backgroundColor: BG }}>
              <button onClick={() => setActiveTab("sepet")}
                className="w-full py-4 font-bold text-sm flex items-center justify-between px-5 rounded-xl"
                style={{ backgroundColor: BC, color: BG }}>
                <span>{cartCount} ürün</span>
                <span className="flex items-center gap-1">{hasOrdered ? "Siparişe Ekle" : "Sipariş Ver"} <ChevronRight size={16} /></span>
                <span>₺{cartTotal.toFixed(0)}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* SEPET TAB */}
      {activeTab === "sepet" && (
        <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
          {orderSent ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
              <div className="text-6xl">✅</div>
              <h2 className="text-xl font-bold text-white">Siparişiniz Alındı!</h2>
              <p className="text-gray-400 text-sm">Mutfağımız siparişinizi hazırlamaya başladı. Kısa sürede servis edilecektir.</p>
            </div>
          ) : cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3">
              <ShoppingCart size={48} className="text-gray-700" />
              <p className="text-gray-500">Sepetiniz boş</p>
              <button onClick={() => setActiveTab("menu")}
                className="px-6 py-2 text-sm font-semibold rounded-lg"
                style={{ backgroundColor: BC, color: BG }}>
                Menüye Dön
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {cart.map((item) => (
                  <div key={item.menuItemId} className="border border-[#2A2A2A] rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-brand text-sm font-bold mt-0.5">{item.price}</p>
                      </div>
                      <button onClick={() => deleteFromCart(item.menuItemId)}>
                        <Trash2 size={15} className="text-gray-600 hover:text-red-400 transition-colors" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button onClick={() => removeFromCart(item.menuItemId)}
                          className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: "#2A2A2A" }}>
                          <Minus size={12} />
                        </button>
                        <span className="font-bold w-5 text-center">{item.adet}</span>
                        <button onClick={() => addToCart({ id: item.menuItemId, name: item.name, price: item.price, desc: "", category: "" })}
                          className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: BC, color: BG }}>
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-white">
                        ₺{(parsePrice(item.price) * item.adet).toFixed(0)}
                      </span>
                    </div>
                    {notAktif && (
                      <input
                        placeholder="Not ekle (isteğe bağlı)"
                        value={item.not}
                        onChange={(e) => updateNot(item.menuItemId, e.target.value)}
                        className="mt-3 w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-gray-300 placeholder-gray-600 outline-none"
                      />
                    )}
                  </div>
                ))}

                {/* Genel not */}
                {notAktif && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Genel Not</p>
                    <textarea
                      placeholder="Sipariş için genel bir notunuz var mı?"
                      value={notlar}
                      onChange={(e) => setNotlar(e.target.value)}
                      rows={2}
                      className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-gray-300 placeholder-gray-600 outline-none resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Toplam + Gönder */}
              <div className="p-4 border-t border-[#2A2A2A] bg-black/95 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{cartCount} ürün</span>
                  <span className="font-bold text-white">Toplam: ₺{cartTotal.toFixed(0)}</span>
                </div>
                <button
                  onClick={sendOrder}
                  disabled={sending}
                  className="w-full py-4 font-bold text-sm rounded-xl transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: BC, color: BG }}
                >
                  {sending ? "Gönderiliyor..." : hasOrdered ? "Siparişe Ekle" : "Sipariş Ver"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ÇAĞIR TAB */}
      {activeTab === "cagir" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-sm mx-auto w-full gap-4">
          <p className="text-center text-gray-400 text-sm mb-4">
            Aşağıdaki butonları kullanarak garsonumuzu çağırabilirsiniz.
          </p>

          {talepSent && (
            <div className="w-full bg-green-900/30 border border-green-700 text-green-400 text-center py-4 text-sm rounded-lg">
              ✓ {talepSent === "garson" ? "Garsonunuz geliyor..." : "Hesabınız hazırlanıyor..."}
            </div>
          )}

          <button
            onClick={() => sendTalep("garson")}
            disabled={talepLoading || !!talepSent}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] hover:border-brand transition-colors py-6 flex flex-col items-center gap-2 disabled:opacity-50 rounded-xl"
          >
            <span className="text-4xl">🙋</span>
            <span className="font-semibold tracking-wider uppercase text-sm">Garson Çağır</span>
            <span className="text-gray-500 text-xs">Garsonunuz kısa sürede gelecek</span>
          </button>

          <button
            onClick={() => sendTalep("hesap")}
            disabled={talepLoading || !!talepSent}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] hover:border-brand transition-colors py-6 flex flex-col items-center gap-2 disabled:opacity-50 rounded-xl"
          >
            <span className="text-4xl">🧾</span>
            <span className="font-semibold tracking-wider uppercase text-sm">Hesap İstiyorum</span>
            <span className="text-gray-500 text-xs">Hesabınız hazırlanacak</span>
          </button>
        </div>
      )}
    </div>
  );
}
