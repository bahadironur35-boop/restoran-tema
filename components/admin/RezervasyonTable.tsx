"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Rezervasyon = {
  id: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  notes: string | null;
  status: string;
  createdAt: Date;
};

const statusLabel: Record<string, string> = {
  bekliyor: "Bekliyor",
  onaylandi: "Onaylandı",
  reddedildi: "Reddedildi",
};

const statusClass: Record<string, string> = {
  bekliyor: "bg-yellow-900/40 text-yellow-400",
  onaylandi: "bg-green-900/40 text-green-400",
  reddedildi: "bg-red-900/40 text-red-400",
};

export default function RezervasyonTable({ rezervasyonlar }: { rezervasyonlar: Rezervasyon[] }) {
  const [filter, setFilter] = useState("hepsi");
  const [loading, setLoading] = useState<number | null>(null);
  const router = useRouter();

  const filtered = filter === "hepsi" ? rezervasyonlar : rezervasyonlar.filter((r) => r.status === filter);

  const updateStatus = async (id: number, status: string) => {
    setLoading(id);
    await fetch(`/api/admin/rezervasyon/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(null);
    router.refresh();
  };

  const deleteRez = async (id: number) => {
    if (!confirm("Bu rezervasyonu silmek istediğinizden emin misiniz?")) return;
    setLoading(id);
    await fetch(`/api/admin/rezervasyon/${id}`, { method: "DELETE" });
    setLoading(null);
    router.refresh();
  };

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {["hepsi", "bekliyor", "onaylandi", "reddedildi"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-colors ${
              filter === f ? "bg-[#C9A84C] text-black" : "bg-[#1A1A1A] text-gray-400 hover:text-white border border-[#2A2A2A]"
            }`}
          >
            {f === "hepsi" ? "Hepsi" : statusLabel[f]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-10 text-center text-gray-500">
          Bu kategoride rezervasyon yok.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="bg-[#1A1A1A] border border-[#2A2A2A] p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Misafir</p>
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-sm text-gray-400">{r.phone}</p>
                    <p className="text-sm text-gray-400">{r.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tarih / Saat</p>
                    <p className="font-semibold">{r.date}</p>
                    <p className="text-sm text-gray-400">{r.time}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Kişi Sayısı</p>
                    <p className="font-semibold">{r.guests} kişi</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Notlar</p>
                    <p className="text-sm text-gray-400">{r.notes || "—"}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <span className={`px-3 py-1 text-xs font-semibold ${statusClass[r.status]}`}>
                    {statusLabel[r.status]}
                  </span>
                  {r.status === "bekliyor" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(r.id, "onaylandi")}
                        disabled={loading === r.id}
                        className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs font-semibold transition-colors"
                      >
                        Onayla
                      </button>
                      <button
                        onClick={() => updateStatus(r.id, "reddedildi")}
                        disabled={loading === r.id}
                        className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
                      >
                        Reddet
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => deleteRez(r.id)}
                    disabled={loading === r.id}
                    className="text-xs text-gray-600 hover:text-red-400 transition-colors"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
