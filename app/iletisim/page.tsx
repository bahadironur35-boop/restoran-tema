"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Tema = {
  restaurantName: string;
  logoUrl: string;
  logoPozisyon: string;
  brandColor: string;
  brandColorDark: string;
  brandTextLight: string;
  address: string;
  phone: string;
  email: string;
  weekdayHours: string;
  weekendHours: string;
};

const DEFAULT_TEMA: Tema = {
  restaurantName: "EatOs",
  logoUrl: "",
  logoPozisyon: "orta",
  brandColor: "#C9A84C",
  brandColorDark: "#0F0F0F",
  brandTextLight: "#FFFFFF",
  address: "",
  phone: "",
  email: "",
  weekdayHours: "",
  weekendHours: "",
};

export default function IletisimPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [tema, setTema] = useState<Tema>(DEFAULT_TEMA);

  useEffect(() => {
    fetch("/api/tema").then((r) => r.json()).then((t) => setTema((p) => ({ ...p, ...t })));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/iletisim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const { restaurantName, logoUrl, logoPozisyon, brandColor, brandColorDark, brandTextLight, address, phone, email, weekdayHours, weekendHours } = tema;

  const inputCls = "w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white px-4 py-3 focus:outline-none transition-colors";

  return (
    <>
      <Navbar restaurantName={restaurantName} logoUrl={logoUrl} logoPozisyon={logoPozisyon} brandColor={brandColor} />
      <main className="pt-24 pb-20 px-6 min-h-screen" style={{ backgroundColor: brandColorDark }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="tracking-widest uppercase text-sm mb-2" style={{ color: brandColor }}>{restaurantName}</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: brandTextLight }}>İletişim</h1>
            <div className="w-16 h-0.5 mx-auto" style={{ backgroundColor: brandColor }} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Info */}
            <div className="space-y-8">
              {address && (
                <div>
                  <h2 className="uppercase tracking-wider text-sm font-semibold mb-3" style={{ color: brandColor }}>Adres</h2>
                  <p className="text-gray-300">{address}</p>
                </div>
              )}
              {phone && (
                <div>
                  <h2 className="uppercase tracking-wider text-sm font-semibold mb-3" style={{ color: brandColor }}>Telefon</h2>
                  <p className="text-gray-300">{phone}</p>
                </div>
              )}
              {email && (
                <div>
                  <h2 className="uppercase tracking-wider text-sm font-semibold mb-3" style={{ color: brandColor }}>E-posta</h2>
                  <p className="text-gray-300">{email}</p>
                </div>
              )}
              {(weekdayHours || weekendHours) && (
                <div>
                  <h2 className="uppercase tracking-wider text-sm font-semibold mb-3" style={{ color: brandColor }}>Çalışma Saatleri</h2>
                  {weekdayHours && <p className="text-gray-300">{weekdayHours}</p>}
                  {weekendHours && <p className="text-gray-300">{weekendHours}</p>}
                </div>
              )}

              {/* Map embed placeholder */}
              <div className="h-48 bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">
                <span className="text-gray-500 text-sm">Harita — Google Maps iframe buraya eklenecek</span>
              </div>
            </div>

            {/* Form */}
            <div>
              {status === "success" ? (
                <div className="bg-[#1A1A1A] border p-10 text-center h-full flex flex-col items-center justify-center" style={{ borderColor: brandColor }}>
                  <div className="text-5xl mb-4">✓</div>
                  <h2 className="text-xl font-bold mb-2" style={{ color: brandColor }}>Mesajınız İletildi!</h2>
                  <p className="text-gray-400">En kısa sürede size geri döneceğiz.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Ad Soyad *</label>
                    <input name="name" value={form.name} onChange={handleChange} required className={inputCls} style={{ ["--focus-color" as string]: brandColor }} placeholder="Ali Yılmaz" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">E-posta *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required className={inputCls} placeholder="ali@email.com" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Mesajınız *</label>
                    <textarea name="message" value={form.message} onChange={handleChange} required rows={6} className={inputCls} placeholder="Mesajınızı yazın..." />
                  </div>
                  {status === "error" && <p className="text-red-400 text-sm">Bir hata oluştu. Lütfen tekrar deneyin.</p>}
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-4 text-sm tracking-widest uppercase font-bold transition-opacity disabled:opacity-60"
                    style={{ backgroundColor: brandColor, color: brandColorDark }}
                  >
                    {status === "loading" ? "Gönderiliyor..." : "Mesaj Gönder"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer
        restaurantName={restaurantName}
        address={address}
        phone={phone}
        email={email}
        weekdayHours={weekdayHours}
        weekendHours={weekendHours}
        brandColor={brandColor}
      />
    </>
  );
}
