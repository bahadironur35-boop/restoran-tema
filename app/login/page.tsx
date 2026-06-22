"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email || undefined, password }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      const data = await res.json();
      setError(data.error || "Giriş başarısız.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#0A192F" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 flex flex-col items-center gap-3">
          <h1 className="text-3xl font-bold tracking-widest">
            <span style={{ color: "#ffffff" }}>Eat</span><span style={{ color: "#1A73E8" }}>Os</span>
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Yönetim Paneli</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-4 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              className="input-field w-full"
              placeholder="kullanici@restoran.com"
            />
            <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>Boş bırakırsanız master şifre ile giriş yapılır</p>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: "#64748B" }}>Şifre</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field w-full pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#94A3B8" }}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
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
