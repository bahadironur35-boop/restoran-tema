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
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#0A192F" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-widest uppercase" style={{ color: "#1A73E8" }}>EatOs</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>Yönetim Paneli</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-4 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="input-field w-full"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm" style={{ color: "#EF4444" }}>{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full text-sm tracking-widest uppercase">
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
