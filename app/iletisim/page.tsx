"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function IletisimPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

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

  const inputCls = "w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors";

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 px-6 min-h-screen bg-[#0F0F0F]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#C9A84C] tracking-widest uppercase text-sm mb-2">La Maison</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">İletişim</h1>
            <div className="w-16 h-0.5 bg-[#C9A84C] mx-auto" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-[#C9A84C] uppercase tracking-wider text-sm font-semibold mb-3">Adres</h2>
                <p className="text-gray-300">Bağdat Caddesi No: 123</p>
                <p className="text-gray-300">Kadıköy, İstanbul 34710</p>
              </div>
              <div>
                <h2 className="text-[#C9A84C] uppercase tracking-wider text-sm font-semibold mb-3">Telefon</h2>
                <p className="text-gray-300">+90 216 123 45 67</p>
              </div>
              <div>
                <h2 className="text-[#C9A84C] uppercase tracking-wider text-sm font-semibold mb-3">E-posta</h2>
                <p className="text-gray-300">info@lamaison.com.tr</p>
              </div>
              <div>
                <h2 className="text-[#C9A84C] uppercase tracking-wider text-sm font-semibold mb-3">Çalışma Saatleri</h2>
                <p className="text-gray-300">Pazartesi – Cuma: 12:00 – 23:00</p>
                <p className="text-gray-300">Cumartesi – Pazar: 11:00 – 24:00</p>
              </div>

              {/* Map embed placeholder */}
              <div className="h-48 bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">
                <span className="text-gray-500 text-sm">Harita — Google Maps iframe buraya eklenecek</span>
              </div>
            </div>

            {/* Form */}
            <div>
              {status === "success" ? (
                <div className="bg-[#1A1A1A] border border-[#C9A84C] p-10 text-center h-full flex flex-col items-center justify-center">
                  <div className="text-5xl mb-4">✓</div>
                  <h2 className="text-xl font-bold text-[#C9A84C] mb-2">Mesajınız İletildi!</h2>
                  <p className="text-gray-400">En kısa sürede size geri döneceğiz.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Ad Soyad *</label>
                    <input name="name" value={form.name} onChange={handleChange} required className={inputCls} placeholder="Ali Yılmaz" />
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
                  <button type="submit" disabled={status === "loading"} className="btn-primary w-full text-sm tracking-widest uppercase">
                    {status === "loading" ? "Gönderiliyor..." : "Mesaj Gönder"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
