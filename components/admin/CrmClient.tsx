"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type Ziyaret = { id: number; tarih: string; kisiSayisi: number };
type Rezervasyon = { id: number; date: string; status: string };
type Musteri = {
  id: number; name: string; email: string; phone: string | null;
  dogumGunu: string | null; vip: boolean; notlar: string | null;
  ziyaretler: Ziyaret[]; rezervasyonlar: Rezervasyon[];
  createdAt: string;
};

function dogumGunuYaklas(dogumGunu: string | null): boolean {
  if (!dogumGunu) return false;
  const today = new Date();
  const dg = new Date(dogumGunu);
  const thisYear = new Date(today.getFullYear(), dg.getMonth(), dg.getDate());
  const diff = (thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 14;
}

export default function CrmClient() {
  const [musteriler, setMusteriler] = useState<Musteri[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("hepsi");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", dogumGunu: "", notlar: "" });
  const [loading, setLoading] = useState(false);

  const fetchMusteriler = () =>
    fetch("/api/admin/musteri").then((r) => r.json()).then(setMusteriler);

  useEffect(() => { fetchMusteriler(); }, []);

  const toggleVip = async (id: number, vip: boolean) => {
    await fetch(`/api/admin/musteri/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vip: !vip }),
    });
    fetchMusteriler();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/musteri", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", email: "", phone: "", dogumGunu: "", notlar: "" });
    setShowForm(false);
    setLoading(false);
    fetchMusteriler();
  };

  const filtered = musteriler.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.phone ?? "").includes(search);
    const matchFilter =
      filter === "hepsi" ? true :
      filter === "vip" ? m.vip :
      filter === "dogumgunu" ? dogumGunuYaklas(m.dogumGunu) : true;
    return matchSearch && matchFilter;
  });

  const dgYaklasanlar = musteriler.filter((m) => dogumGunuYaklas(m.dogumGunu));
  const inputCls = "w-full bg-[#0F0F0F] border border-[#2A2A2A] text-white px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors";

  return (
    <div className="space-y-6">
      {/* Doğum günü uyarısı */}
      {dgYaklasanlar.length > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-700 p-4 flex items-start gap-3">
          <span className="text-2xl">🎂</span>
          <div>
            <p className="font-semibold text-yellow-400 text-sm">Yaklaşan Doğum Günleri (14 gün)</p>
            <p className="text-yellow-300 text-sm">{dgYaklasanlar.map((m) => `${m.name} (${m.dogumGunu})`).join(" · ")}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Toplam Müşteri", value: musteriler.length, color: "text-white" },
          { label: "VIP", value: musteriler.filter((m) => m.vip).length, color: "text-[#C9A84C]" },
          { label: "Bu Ay Eklenen", value: musteriler.filter((m) => new Date(m.createdAt).getMonth() === new Date().getMonth()).length, color: "text-green-400" },
          { label: "Doğum Günü Yaklaşan", value: dgYaklasanlar.length, color: "text-yellow-400" },
        ].map((s) => (
          <div key={s.label} className="bg-[#1A1A1A] border border-[#2A2A2A] p-5">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-gray-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "hepsi", label: "Hepsi" },
            { key: "vip", label: "⭐ VIP" },
            { key: "dogumgunu", label: "🎂 Doğum Günü" },
          ].map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider font-semibold transition-colors ${filter === f.key ? "bg-[#C9A84C] text-black" : "bg-[#1A1A1A] text-gray-400 border border-[#2A2A2A] hover:text-white"}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="İsim, e-posta veya telefon ara..."
            className="bg-[#1A1A1A] border border-[#2A2A2A] text-white px-4 py-2 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors flex-1 md:w-64"
          />
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-xs tracking-widest uppercase whitespace-nowrap">
            + Ekle
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6">
          <h2 className="text-[#C9A84C] uppercase tracking-wider text-sm font-semibold mb-4">Yeni Müşteri</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Ad Soyad *</label>
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">E-posta *</label>
              <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Telefon</label>
              <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Doğum Günü</label>
              <input type="date" value={form.dogumGunu} onChange={(e) => setForm((p) => ({ ...p, dogumGunu: e.target.value }))} className={inputCls} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Notlar</label>
              <input value={form.notlar} onChange={(e) => setForm((p) => ({ ...p, notlar: e.target.value }))} className={inputCls} placeholder="Tercihler, alerjiler..." />
            </div>
            <div className="md:col-span-3 flex gap-3">
              <button type="submit" disabled={loading} className="btn-primary text-xs tracking-widest uppercase">
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white text-sm transition-colors">
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Müşteri listesi */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-10 text-center text-gray-500">
            Müşteri bulunamadı.
          </div>
        ) : (
          filtered.map((m) => (
            <div key={m.id} className={`bg-[#1A1A1A] border p-5 flex items-center gap-4 ${m.vip ? "border-[#C9A84C]/50" : "border-[#2A2A2A]"}`}>
              {/* Avatar */}
              <div className="w-10 h-10 bg-[#2A2A2A] flex items-center justify-center text-lg font-bold text-[#C9A84C] flex-shrink-0">
                {m.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold truncate">{m.name}</p>
                  {m.vip && <span className="text-[#C9A84C] text-xs">⭐ VIP</span>}
                  {dogumGunuYaklas(m.dogumGunu) && <span className="text-yellow-400 text-xs">🎂</span>}
                </div>
                <p className="text-gray-500 text-xs truncate">{m.email} {m.phone && `· ${m.phone}`}</p>
                {m.notlar && <p className="text-gray-600 text-xs mt-0.5 truncate">📝 {m.notlar}</p>}
              </div>

              {/* Stats */}
              <div className="hidden md:flex gap-6 text-center">
                <div>
                  <p className="text-lg font-bold text-white">{m.ziyaretler.length}</p>
                  <p className="text-gray-600 text-xs">Ziyaret</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{m.rezervasyonlar.length}</p>
                  <p className="text-gray-600 text-xs">Rezerv.</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleVip(m.id, m.vip)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${m.vip ? "bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/40 hover:bg-red-900/20 hover:text-red-400 hover:border-red-800" : "bg-[#0F0F0F] text-gray-500 border border-[#2A2A2A] hover:border-[#C9A84C] hover:text-[#C9A84C]"}`}
                >
                  {m.vip ? "VIP ✓" : "VIP Yap"}
                </button>
                <Link href={`/admin/crm/${m.id}`} className="px-3 py-1.5 text-xs font-semibold bg-[#0F0F0F] border border-[#2A2A2A] text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
                  Detay
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
