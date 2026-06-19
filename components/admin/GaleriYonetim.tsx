"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type GaleriItem = { id: number; url: string; alt: string; order: number };

export default function GaleriYonetim({ items }: { items: GaleriItem[] }) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/galeri", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, alt, order: items.length }),
    });
    setUrl(""); setAlt("");
    setLoading(false);
    router.refresh();
  };

  const deleteItem = async (id: number) => {
    if (!confirm("Bu fotoğrafı silmek istediğinizden emin misiniz?")) return;
    await fetch(`/api/admin/galeri/${id}`, { method: "DELETE" });
    router.refresh();
  };

  const inputCls = "input-field";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div>
        <div className="card p-6">
          <h2 className="uppercase tracking-wider text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>Fotoğraf Ekle</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-xs text-mu uppercase tracking-wider mb-1">Görsel URL *</label>
              <input value={url} onChange={(e) => setUrl(e.target.value)} required className={inputCls} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-xs text-mu uppercase tracking-wider mb-1">Açıklama</label>
              <input value={alt} onChange={(e) => setAlt(e.target.value)} className={inputCls} placeholder="Restoran atmosferi" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full text-xs tracking-widest uppercase">
              {loading ? "Ekleniyor..." : "Ekle"}
            </button>
          </form>
          <p className="text-mu text-xs mt-4">Unsplash, Cloudinary veya kendi sunucunuzdaki URL&apos;leri ekleyebilirsiniz.</p>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {items.map((item) => (
            <div key={item.id} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.alt} className="w-full h-32 object-cover rounded-lg" />
              <button
                onClick={() => deleteItem(item.id)}
                className="absolute top-1 right-1 text-white w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                style={{ backgroundColor: "#EF4444" }}
              >
                ×
              </button>
              {item.alt && (
                <p className="text-xs text-mu mt-1 truncate">{item.alt}</p>
              )}
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-3 card p-10 text-center text-mu text-sm">
              Henüz fotoğraf eklenmedi.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
