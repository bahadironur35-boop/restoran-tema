"use client";
import { useState } from "react";

const defaultSettings = {
  restaurantName: "La Maison",
  phone: "+90 216 123 45 67",
  email: "info@lamaison.com.tr",
  address: "Bağdat Caddesi No: 123, Kadıköy, İstanbul",
  weekdayHours: "12:00 – 23:00",
  weekendHours: "11:00 – 24:00",
  adminPassword: "",
  newPassword: "",
};

export default function AyarlarPage() {
  const [form, setForm] = useState(defaultSettings);
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputCls = "w-full bg-[#0F0F0F] border border-[#2A2A2A] text-white px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors";

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Ayarlar</h1>
      <form onSubmit={handleSave} className="space-y-8">

        <section className="bg-[#1A1A1A] border border-[#2A2A2A] p-6 space-y-4">
          <h2 className="text-[#C9A84C] uppercase tracking-wider text-sm font-semibold mb-4">Restoran Bilgileri</h2>
          {[
            { name: "restaurantName", label: "Restoran Adı" },
            { name: "phone", label: "Telefon" },
            { name: "email", label: "E-posta" },
            { name: "address", label: "Adres" },
            { name: "weekdayHours", label: "Hafta İçi Saatler" },
            { name: "weekendHours", label: "Hafta Sonu Saatler" },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">{f.label}</label>
              <input name={f.name} value={(form as Record<string, string>)[f.name]} onChange={handleChange} className={inputCls} />
            </div>
          ))}
        </section>

        <section className="bg-[#1A1A1A] border border-[#2A2A2A] p-6 space-y-4">
          <h2 className="text-[#C9A84C] uppercase tracking-wider text-sm font-semibold mb-4">Şifre Değiştir</h2>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Mevcut Şifre</label>
            <input name="adminPassword" type="password" value={form.adminPassword} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Yeni Şifre</label>
            <input name="newPassword" type="password" value={form.newPassword} onChange={handleChange} className={inputCls} />
          </div>
        </section>

        <button type="submit" className="btn-primary text-sm tracking-widest uppercase">
          {saved ? "Kaydedildi ✓" : "Kaydet"}
        </button>
      </form>
    </div>
  );
}
