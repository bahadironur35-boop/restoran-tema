"use client";
import { useState, useEffect } from "react";

const initialForm = {
  name: "", email: "", phone: "", date: "", time: "", guests: "2", notes: "",
};

const DEFAULT_SLOTS = ["12:00","12:30","13:00","13:30","19:00","19:30","20:00","20:30","21:00","21:30"];

export default function RezervasyonEmbed() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [doluSaatler, setDoluSaatler] = useState<Record<string, boolean>>({});
  const [yogunSaatler, setYogunSaatler] = useState<Record<string, number>>({});
  const [timeSlots, setTimeSlots] = useState<string[]>(DEFAULT_SLOTS);
  const [maksKisi, setMaksKisi] = useState(8);
  const [brandColor, setBrandColor] = useState("#C9A84C");
  const [restaurantName, setRestaurantName] = useState("EatOs");

  useEffect(() => {
    fetch("/api/tema").then((r) => r.json()).then((t) => {
      if (t.brandColor) setBrandColor(t.brandColor);
      if (t.restaurantName) setRestaurantName(t.restaurantName);
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
        if (form.time && data.dolu?.[form.time]) setForm((p) => ({ ...p, time: "" }));
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
      setStatus(res.ok ? "success" : "error");
      if (res.ok) setForm(initialForm);
    } catch { setStatus("error"); }
  };

  const inp = {
    className: "w-full px-4 py-3 text-sm outline-none transition-colors",
    style: { backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", color: "#1A2332" },
  };

  if (status === "success") return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#fff" }}>
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: brandColor + "20" }}>
          <span className="text-2xl">✓</span>
        </div>
        <h2 className="text-xl font-bold" style={{ color: "#1A2332" }}>Rezervasyonunuz Alındı!</h2>
        <p className="text-sm" style={{ color: "#64748B" }}>{restaurantName} ekibi en kısa sürede sizinle iletişime geçecek.</p>
        <button onClick={() => setStatus("idle")}
          className="mt-4 px-6 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: brandColor }}>
          Yeni Rezervasyon
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6" style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
      <div className="max-w-lg mx-auto space-y-4">
        <div className="text-center pb-2">
          <h2 className="text-xl font-bold" style={{ color: "#1A2332" }}>Rezervasyon</h2>
          <p className="text-sm mt-1" style={{ color: "#64748B" }}>{restaurantName}</p>
          <div className="w-10 h-0.5 mx-auto mt-2" style={{ backgroundColor: brandColor }} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748B" }}>Ad Soyad *</label>
              <input {...inp} name="name" value={form.name} onChange={handleChange} required placeholder="Ali Yılmaz" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748B" }}>Telefon *</label>
              <input {...inp} name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="+90 5XX XXX XX XX" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#64748B" }}>E-posta *</label>
            <input {...inp} name="email" type="email" value={form.email} onChange={handleChange} required placeholder="ali@email.com" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748B" }}>Tarih *</label>
              <input {...inp} name="date" type="date" value={form.date} onChange={handleChange} required
                min={new Date().toISOString().split("T")[0]} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748B" }}>Kişi Sayısı *</label>
              <select {...inp} name="guests" value={form.guests} onChange={handleChange}>
                {Array.from({ length: maksKisi }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n} Kişi</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#64748B" }}>
              Saat * {!form.date && <span style={{ color: "#94A3B8" }}>(Önce tarih seçin)</span>}
            </label>
            {form.date ? (
              <div className="grid grid-cols-4 gap-1.5">
                {timeSlots.map((t) => {
                  const dolu = doluSaatler[t];
                  const yogun = !dolu && (yogunSaatler[t] ?? 0) >= 2;
                  const secili = form.time === t;
                  return (
                    <button key={t} type="button" disabled={dolu}
                      onClick={() => !dolu && setForm((p) => ({ ...p, time: t }))}
                      className="py-2 text-xs font-semibold rounded-lg transition-all"
                      style={{
                        backgroundColor: secili ? brandColor : dolu ? "#F1F5F9" : "#F8FAFC",
                        color: secili ? "#fff" : dolu ? "#CBD5E1" : "#1A2332",
                        border: `1px solid ${secili ? brandColor : yogun ? "#F59E0B" : "#E2E8F0"}`,
                        cursor: dolu ? "not-allowed" : "pointer",
                      }}>
                      {t}
                      {dolu && <span className="block text-[9px]" style={{ color: "#CBD5E1" }}>Dolu</span>}
                      {yogun && !dolu && <span className="block text-[9px]" style={{ color: "#F59E0B" }}>Son</span>}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-3 text-sm text-center rounded-lg" style={{ backgroundColor: "#F8FAFC", color: "#94A3B8", border: "1px solid #E2E8F0" }}>
                Önce tarih seçin
              </div>
            )}
            <input type="hidden" name="time" value={form.time} required />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#64748B" }}>Notlar</label>
            <textarea {...inp} name="notes" value={form.notes} onChange={handleChange} rows={3}
              placeholder="Alerji, özel istek, doğum günü vb." />
          </div>

          {status === "error" && (
            <p className="text-xs text-center py-2 rounded-lg"
              style={{ backgroundColor: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA" }}>
              Bir hata oluştu. Lütfen tekrar deneyin.
            </p>
          )}

          <button type="submit" disabled={status === "loading" || !form.time}
            className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-opacity disabled:opacity-50"
            style={{ backgroundColor: brandColor }}>
            {status === "loading" ? "Gönderiliyor..." : "Rezervasyon Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
