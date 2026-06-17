"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Musteri = any;

const statusLabel: Record<string, { label: string; cls: string }> = {
  bekliyor: { label: "Bekliyor", cls: "text-yellow-400" },
  onaylandi: { label: "Onaylandı", cls: "text-green-400" },
  reddedildi: { label: "Reddedildi", cls: "text-red-400" },
};

export default function MusteriDetay({ musteri: m }: { musteri: Musteri }) {
  const router = useRouter();
  const [editForm, setEditForm] = useState({
    name: m.name, phone: m.phone ?? "", dogumGunu: m.dogumGunu ?? "", notlar: m.notlar ?? "", vip: m.vip,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [ziyaretForm, setZiyaretForm] = useState({ tarih: "", kisiSayisi: "2", not: "" });
  const [addingZiyaret, setAddingZiyaret] = useState(false);

  const saveEdit = async () => {
    setSaving(true);
    await fetch(`/api/admin/musteri/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); router.refresh(); }, 1500);
  };

  const addZiyaret = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/admin/musteri/${m.id}/ziyaret`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ziyaretForm),
    });
    setZiyaretForm({ tarih: "", kisiSayisi: "2", not: "" });
    setAddingZiyaret(false);
    router.refresh();
  };

  const inputCls = "w-full bg-[#0F0F0F] border border-[#2A2A2A] text-white px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Sol: Profil düzenle */}
      <div className="space-y-6">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6">
          <div className="w-16 h-16 bg-[#2A2A2A] flex items-center justify-center text-3xl font-bold text-[#C9A84C] mb-4">
            {m.name.charAt(0).toUpperCase()}
          </div>
          <p className="text-gray-500 text-xs mb-1">{m.email}</p>

          <div className="space-y-3 mt-4">
            {[
              { label: "Ad Soyad", key: "name", type: "text" },
              { label: "Telefon", key: "phone", type: "tel" },
              { label: "Doğum Günü", key: "dogumGunu", type: "date" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">{f.label}</label>
                <input
                  type={f.type}
                  value={(editForm as Record<string, string | boolean>)[f.key] as string}
                  onChange={(e) => setEditForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  className={inputCls}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Notlar</label>
              <textarea
                value={editForm.notlar}
                onChange={(e) => setEditForm((p) => ({ ...p, notlar: e.target.value }))}
                rows={3}
                className={`${inputCls} resize-none`}
                placeholder="Tercihler, alerjiler, özel istekler..."
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.vip}
                onChange={(e) => setEditForm((p) => ({ ...p, vip: e.target.checked }))}
                className="accent-[#C9A84C]"
              />
              <span className="text-sm text-[#C9A84C]">⭐ VIP Müşteri</span>
            </label>
            <button onClick={saveEdit} disabled={saving} className="btn-primary w-full text-xs tracking-widest uppercase">
              {saving ? "Kaydediliyor..." : saved ? "Kaydedildi ✓" : "Kaydet"}
            </button>
          </div>
        </div>

        {/* Özet istatistikler */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6 grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-[#C9A84C]">{m.ziyaretler.length}</p>
            <p className="text-gray-500 text-xs">Toplam Ziyaret</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{// eslint-disable-next-line @typescript-eslint/no-explicit-any
m.rezervasyonlar.filter((r: any) => r.status === "onaylandi").length}</p>
            <p className="text-gray-500 text-xs">Onaylı Rezerv.</p>
          </div>
        </div>
      </div>

      {/* Sağ: Ziyaret geçmişi + Rezervasyonlar */}
      <div className="lg:col-span-2 space-y-6">
        {/* Ziyaret geçmişi */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#C9A84C] uppercase tracking-wider text-sm">Ziyaret Geçmişi</h2>
            <button
              onClick={() => setAddingZiyaret(!addingZiyaret)}
              className="text-xs text-gray-500 hover:text-[#C9A84C] transition-colors"
            >
              + Manuel Ekle
            </button>
          </div>

          {addingZiyaret && (
            <form onSubmit={addZiyaret} className="grid grid-cols-3 gap-3 mb-4 p-4 border border-[#2A2A2A] bg-[#0F0F0F]">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tarih</label>
                <input type="date" value={ziyaretForm.tarih} onChange={(e) => setZiyaretForm((p) => ({ ...p, tarih: e.target.value }))} required className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Kişi</label>
                <select value={ziyaretForm.kisiSayisi} onChange={(e) => setZiyaretForm((p) => ({ ...p, kisiSayisi: e.target.value }))} className={inputCls}>
                  {[1,2,3,4,5,6,7,8].map((n) => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Not</label>
                <input value={ziyaretForm.not} onChange={(e) => setZiyaretForm((p) => ({ ...p, not: e.target.value }))} className={inputCls} />
              </div>
              <div className="col-span-3">
                <button type="submit" className="btn-primary text-xs tracking-widest uppercase">Ekle</button>
              </div>
            </form>
          )}

          {m.ziyaretler.length === 0 ? (
            <p className="text-gray-600 text-sm">Henüz ziyaret kaydı yok.</p>
          ) : (
            <div className="space-y-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {m.ziyaretler.map((z: any) => (
                <div key={z.id} className="flex items-center justify-between py-2 border-b border-[#2A2A2A] last:border-0">
                  <div>
                    <p className="text-sm font-medium">{z.tarih}</p>
                    {z.not && <p className="text-gray-500 text-xs">{z.not}</p>}
                  </div>
                  <span className="text-gray-500 text-sm">{z.kisiSayisi} kişi</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rezervasyon geçmişi */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-6">
          <h2 className="font-semibold text-[#C9A84C] uppercase tracking-wider text-sm mb-4">Rezervasyon Geçmişi</h2>
          {m.rezervasyonlar.length === 0 ? (
            <p className="text-gray-600 text-sm">Henüz rezervasyon kaydı yok.</p>
          ) : (
            <div className="space-y-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {m.rezervasyonlar.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-[#2A2A2A] last:border-0">
                  <div>
                    <p className="text-sm font-medium">{r.date} — {r.time}</p>
                    <p className="text-gray-500 text-xs">{r.guests} kişi {r.notes ? `· ${r.notes}` : ""}</p>
                  </div>
                  <span className={`text-xs font-semibold ${statusLabel[r.status]?.cls}`}>
                    {statusLabel[r.status]?.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
