"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  date: "",
  time: "",
  guests: "2",
  notes: "",
};

const DEFAULT_SLOTS = ["12:00","12:30","13:00","13:30","19:00","19:30","20:00","20:30","21:00","21:30"];

export default function Rezervasyon() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [doluSaatler, setDoluSaatler] = useState<Record<string, boolean>>({});
  const [yogunSaatler, setYogunSaatler] = useState<Record<string, number>>({});
  const [tema, setTema] = useState({ restaurantName: "EatOs", logoUrl: "", logoPozisyon: "orta", brandColor: "#C9A84C" });
  const [timeSlots, setTimeSlots] = useState<string[]>(DEFAULT_SLOTS);
  const [maksKisi, setMaksKisi] = useState(8);

  useEffect(() => {
    fetch("/api/tema").then((r) => r.json()).then((t) => {
      setTema((p) => ({ ...p, ...t }));
      if (t.rezervasyonSaatleri) {
        const slots = t.rezervasyonSaatleri.split(",").map((s: string) => s.trim()).filter(Boolean);
        if (slots.length > 0) setTimeSlots(slots);
      }
      if (t.rezervasyonMaksKisi) setMaksKisi(Number(t.rezervasyonMaksKisi) || 8);
    });
  }, []);

  useEffect(() => {
    if (!form.date) { setDoluSaatler({}); setYogunSaatler({}); return; }
    fetch(`/api/musaitlik?date=${form.date}`)
      .then((r) => r.json())
      .then((data) => {
        setDoluSaatler(data.dolu ?? {});
        setYogunSaatler(data.sayac ?? {});
        // Seçili saat doluysa sıfırla
        if (form.time && data.dolu?.[form.time]) {
          setForm((p) => ({ ...p, time: "" }));
        }
      });
  }, [form.date]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/rezervasyon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm(initialForm);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const inputCls = "w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors";

  return (
    <>
      <Navbar restaurantName={tema.restaurantName} logoUrl={tema.logoUrl} logoPozisyon={tema.logoPozisyon} brandColor={tema.brandColor} />
      <main className="pt-24 pb-20 px-6 min-h-screen bg-[#0F0F0F]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#C9A84C] tracking-widest uppercase text-sm mb-2">EatOs</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Rezervasyon</h1>
            <div className="w-16 h-0.5 bg-[#C9A84C] mx-auto" />
            <p className="text-gray-400 mt-6">
              Masanızı rezerve edin, 24 saat içinde telefon veya e-posta ile onay alırsınız.
            </p>
          </div>

          {status === "success" ? (
            <div className="bg-[#1A1A1A] border border-[#C9A84C] p-10 text-center">
              <div className="text-5xl mb-4">✓</div>
              <h2 className="text-2xl font-bold text-[#C9A84C] mb-2">Rezervasyonunuz Alındı!</h2>
              <p className="text-gray-400">En kısa sürede sizinle iletişime geçeceğiz.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-[#1A1A1A] border border-[#2A2A2A] p-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Ad Soyad *</label>
                  <input name="name" value={form.name} onChange={handleChange} required className={inputCls} placeholder="Ali Yılmaz" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">E-posta *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required className={inputCls} placeholder="ali@email.com" />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Telefon *</label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} required className={inputCls} placeholder="+90 5XX XXX XX XX" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Tarih *</label>
                  <input name="date" type="date" value={form.date} onChange={handleChange} required className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Saat *</label>
                  {form.date ? (
                    <div className="grid grid-cols-2 gap-1.5">
                      {timeSlots.map((t) => {
                        const dolu   = doluSaatler[t];
                        const yogun  = !dolu && (yogunSaatler[t] ?? 0) >= 2;
                        const secili = form.time === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            disabled={dolu}
                            onClick={() => !dolu && setForm((p) => ({ ...p, time: t }))}
                            className="px-2 py-2 text-sm font-semibold transition-all relative"
                            style={{
                              backgroundColor: dolu   ? "#1A1A1A"
                                             : secili ? "#C9A84C"
                                             : "#2A2A2A",
                              color: dolu    ? "#555"
                                   : secili  ? "#000"
                                   : "#fff",
                              border: secili ? "1px solid #C9A84C"
                                    : yogun  ? "1px solid #F59E0B44"
                                    : "1px solid transparent",
                              cursor: dolu ? "not-allowed" : "pointer",
                              opacity: dolu ? 0.5 : 1,
                            }}
                          >
                            {t}
                            {dolu  && <span className="block text-[9px] font-normal" style={{ color: "#555" }}>Dolu</span>}
                            {yogun && <span className="block text-[9px] font-normal" style={{ color: "#F59E0B" }}>Son yerler</span>}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="w-full px-4 py-3 text-sm text-gray-600 border border-[#2A2A2A] bg-[#1A1A1A]">
                      Önce tarih seçin
                    </div>
                  )}
                  {/* hidden input for form validation */}
                  <input type="hidden" name="time" value={form.time} required />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Kişi Sayısı *</label>
                  <select name="guests" value={form.guests} onChange={handleChange} className={inputCls}>
                    {Array.from({ length: maksKisi }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n} Kişi</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Notlar</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={4}
                  className={inputCls}
                  placeholder="Alerji, özel istek veya kutlama bilgisi..."
                />
              </div>

              {status === "error" && (
                <p className="text-red-400 text-sm">Bir hata oluştu. Lütfen tekrar deneyin.</p>
              )}

              <button type="submit" disabled={status === "loading"} className="btn-gold w-full text-sm tracking-widest uppercase">
                {status === "loading" ? "Gönderiliyor..." : "Rezervasyon Yap"}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer restaurantName={tema.restaurantName} brandColor={tema.brandColor} />
    </>
  );
}
