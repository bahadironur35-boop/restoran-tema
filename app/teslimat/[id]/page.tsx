"use client";
import { useState, useEffect } from "react";
import { use } from "react";
import { Package, Bike, CheckCircle, XCircle, MapPin, Phone } from "lucide-react";

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
  updatedAt: string;
};

const ADIMLAR = [
  { key: "hazirlaniyor", label: "Hazırlanıyor", icon: Package, desc: "Siparişiniz mutfakta hazırlanıyor" },
  { key: "yolda",        label: "Yolda",        icon: Bike,    desc: "Kurye siparişinizi yola çıktı" },
  { key: "teslim",       label: "Teslim Edildi", icon: CheckCircle, desc: "Afiyet olsun!" },
];

function fmt(n: number) {
  return "₺" + n.toLocaleString("tr-TR", { minimumFractionDigits: 0 });
}

export default function TeslimatTakipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [siparis, setSiparis] = useState<Siparis | null>(null);
  const [hata, setHata] = useState(false);

  const fetchSiparis = async () => {
    const res = await fetch(`/api/admin/teslimat/${id}`);
    if (!res.ok) { setHata(true); return; }
    setSiparis(await res.json());
  };

  useEffect(() => {
    fetchSiparis();
    const iv = setInterval(fetchSiparis, 10000); // 10 sn'de bir güncelle
    return () => clearInterval(iv);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (hata) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0F172A" }}>
      <div className="text-center">
        <XCircle size={48} className="mx-auto mb-4" style={{ color: "#EF4444" }} />
        <p className="text-white font-semibold">Sipariş bulunamadı</p>
      </div>
    </div>
  );

  if (!siparis) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0F172A" }}>
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const aktifAdim = ADIMLAR.findIndex((a) => a.key === siparis.durum);
  const iptal = siparis.durum === "iptal";

  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: "#0F172A" }}>
      {/* Header */}
      <div className="px-5 pt-8 pb-6 text-center">
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#64748B" }}>Sipariş #{siparis.id}</p>
        <h1 className="text-2xl font-bold text-white">Teslimat Takibi</h1>
        <p className="text-sm mt-1" style={{ color: "#64748B" }}>Merhaba, {siparis.musteriAdi}</p>
      </div>

      <div className="px-5 max-w-md mx-auto space-y-4">

        {/* İptal durumu */}
        {iptal && (
          <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: "#EF444415", border: "1px solid #EF444430" }}>
            <XCircle size={36} className="mx-auto mb-2" style={{ color: "#EF4444" }} />
            <p className="font-bold text-white">Sipariş İptal Edildi</p>
            <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>Detay için restoranı arayabilirsiniz</p>
          </div>
        )}

        {/* Durum adımları */}
        {!iptal && (
          <div className="card p-5">
            <div className="space-y-0">
              {ADIMLAR.map((adim, i) => {
                const tamamlandi = i <= aktifAdim;
                const aktif = i === aktifAdim;
                const Icon = adim.icon;
                return (
                  <div key={adim.key} className="flex gap-4">
                    {/* Çizgi + nokta */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        aktif ? "ring-2 ring-offset-2 ring-offset-[#1E293B]" : ""
                      }`}
                        style={{
                          backgroundColor: tamamlandi ? "#1A73E820" : "#1E293B",
                          border: `2px solid ${tamamlandi ? "#1A73E8" : "#334155"}`,
                        }}>
                        <Icon size={15} style={{ color: tamamlandi ? "#1A73E8" : "#475569" }} />
                      </div>
                      {i < ADIMLAR.length - 1 && (
                        <div className="w-0.5 h-8 mt-1" style={{ backgroundColor: i < aktifAdim ? "#1A73E8" : "#334155" }} />
                      )}
                    </div>
                    {/* Metin */}
                    <div className="pb-6">
                      <p className="font-semibold text-sm" style={{ color: tamamlandi ? "#fff" : "#475569" }}>
                        {adim.label}
                        {aktif && <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#1A73E820", color: "#60A5FA" }}>Şu an</span>}
                      </p>
                      {aktif && <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{adim.desc}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Kurye bilgisi */}
        {siparis.kurye && siparis.durum === "yolda" && (
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#3B82F620" }}>
              <Bike size={18} style={{ color: "#3B82F6" }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: "#64748B" }}>Kuryeniz</p>
              <p className="font-semibold text-sm text-white">{siparis.kurye}</p>
            </div>
          </div>
        )}

        {/* Teslimat adresi */}
        <div className="card p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm" style={{ color: "#94A3B8" }}>
            <MapPin size={14} style={{ color: "#64748B" }} />
            {siparis.adres}
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: "#94A3B8" }}>
            <Phone size={14} style={{ color: "#64748B" }} />
            {siparis.telefon}
          </div>
        </div>

        {/* Sipariş özeti */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#64748B" }}>Sipariş Özeti</p>
          </div>
          {siparis.items.map((it) => (
            <div key={it.id} className="flex justify-between items-center px-5 py-3 text-sm"
              style={{ borderBottom: "1px solid var(--border)" }}>
              <span style={{ color: "#94A3B8" }}>{it.adet}× {it.name}</span>
              <span style={{ color: "#64748B" }}>{fmt(it.price * it.adet)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center px-5 py-3 font-bold text-sm">
            <span className="text-white">Toplam</span>
            <span style={{ color: "#22C55E" }}>{fmt(siparis.toplamTutar)}</span>
          </div>
        </div>

        <p className="text-center text-xs" style={{ color: "#475569" }}>
          Otomatik güncelleniyor · Her 10 saniyede bir
        </p>
      </div>
    </div>
  );
}
