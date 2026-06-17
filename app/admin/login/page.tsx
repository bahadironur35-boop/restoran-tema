"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Şifre hatalı.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#C9A84C] tracking-widest uppercase">La Maison</h1>
          <p className="text-gray-500 text-sm mt-1">Yönetim Paneli</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-[#1A1A1A] border border-[#2A2A2A] p-8 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="w-full bg-[#0F0F0F] border border-[#2A2A2A] text-white px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full text-sm tracking-widest uppercase">
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
