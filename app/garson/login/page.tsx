"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChefHat } from "lucide-react";

export default function GarsonLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  const giris = async (e: React.FormEvent) => {
    e.preventDefault();
    setYukleniyor(true); setHata("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: sifre }),
    });
    if (res.ok) {
      router.push("/garson");
    } else {
      const d = await res.json();
      setHata(d.error ?? "Giriş başarısız");
    }
    setYukleniyor(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#0F172A" }}>
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
            style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
            <ChefHat size={28} color="white" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-white">Garson Girişi</h1>
          <p className="text-sm" style={{ color: "#64748B" }}>EatOs · Servis Ekranı</p>
        </div>

        <form onSubmit={giris} className="space-y-4">
          <div>
            <label className="block text-sm mb-1.5 font-medium" style={{ color: "#94A3B8" }}>E-posta</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)}
              type="email" required autoComplete="email"
              className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
              placeholder="garson@restoran.com" />
          </div>
          <div>
            <label className="block text-sm mb-1.5 font-medium" style={{ color: "#94A3B8" }}>Şifre</label>
            <input value={sifre} onChange={(e) => setSifre(e.target.value)}
              type="password" required autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
              style={{ backgroundColor: "#1E293B", border: "1px solid #334155" }}
              placeholder="••••••••" />
          </div>

          {hata && (
            <p className="text-sm text-center px-3 py-2 rounded-lg"
              style={{ backgroundColor: "#EF444415", color: "#EF4444", border: "1px solid #EF444430" }}>
              {hata}
            </p>
          )}

          <button type="submit" disabled={yukleniyor}
            className="w-full py-3.5 rounded-xl font-bold text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: "#1A73E8" }}>
            {yukleniyor ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
