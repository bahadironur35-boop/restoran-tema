"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Pencil, X, Check } from "lucide-react";

type Kullanici = { id: number; name: string; email: string; role: string; active: boolean };

const ROLLER = [
  { value: "admin",  label: "Admin",       desc: "Tam yetki" },
  { value: "mudur",  label: "Müdür",       desc: "Ayarlar ve kullanıcılar hariç tam yetki" },
  { value: "garson", label: "Garson",      desc: "POS, masa, siparişler, rezervasyon" },
  { value: "sef",    label: "Şef / Mutfak",desc: "Sadece mutfak ekranı" },
];

const roleBadge: Record<string, string> = {
  admin:  "bg-purple-500/20 text-purple-400",
  mudur:  "bg-blue-500/20 text-blue-400",
  garson: "bg-green-500/20 text-green-400",
  sef:    "bg-orange-500/20 text-orange-400",
};

const emptyForm = { name: "", email: "", password: "", role: "garson" };

export default function KullanicilarClient() {
  const [users, setUsers]     = useState<Kullanici[]>([]);
  const [form, setForm]       = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId]   = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "", password: "", active: true });
  const router = useRouter();

  const load = () =>
    fetch("/api/admin/kullanicilar").then((r) => r.json()).then(setUsers);

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/kullanicilar", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { setForm(emptyForm); load(); }
    setLoading(false);
  };

  const startEdit = (u: Kullanici) => {
    setEditId(u.id);
    setEditForm({ name: u.name, email: u.email, role: u.role, password: "", active: u.active });
  };

  const saveEdit = async () => {
    if (!editId) return;
    const body: Record<string, unknown> = { name: editForm.name, email: editForm.email, role: editForm.role, active: editForm.active };
    if (editForm.password) body.password = editForm.password;
    await fetch(`/api/admin/kullanicilar/${editId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setEditId(null); load(); router.refresh();
  };

  const del = async (id: number) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) return;
    await fetch(`/api/admin/kullanicilar/${id}`, { method: "DELETE" });
    load();
  };

  const inputCls = "input-field w-full px-3 py-2 text-sm";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Ekleme Formu */}
      <div className="lg:col-span-1">
        <div className="card p-6">
          <h2 className="font-semibold mb-4 uppercase tracking-wider text-sm" style={{ color: "var(--text)" }}>Yeni Kullanıcı</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-xs mb-1 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Ad Soyad</label>
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required className={inputCls} placeholder="Ahmet Yılmaz" />
            </div>
            <div>
              <label className="block text-xs mb-1 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>E-posta</label>
              <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required className={inputCls} placeholder="ahmet@restoran.com" />
            </div>
            <div>
              <label className="block text-xs mb-1 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Şifre</label>
              <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required className={inputCls} placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-xs mb-1 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Rol</label>
              <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} className={inputCls}>
                {ROLLER.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full text-xs tracking-widest uppercase">
              {loading ? "Ekleniyor..." : "Ekle"}
            </button>
          </form>

          {/* Rol açıklamaları */}
          <div className="mt-6 space-y-2">
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Rol Yetkileri</p>
            {ROLLER.map((r) => (
              <div key={r.value} className="flex items-start gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${roleBadge[r.value]}`}>{r.label}</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{r.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kullanıcı Listesi */}
      <div className="lg:col-span-2">
        <div className="card p-6">
          <h2 className="font-semibold mb-4 uppercase tracking-wider text-sm" style={{ color: "var(--text)" }}>
            Kullanıcılar ({users.length})
          </h2>
          {users.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Henüz kullanıcı yok.</p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="p-4 rounded-xl" style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg)" }}>
                  {editId === u.id ? (
                    /* Düzenleme satırı */
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="Ad Soyad" />
                        <input type="email" value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} className={inputCls} placeholder="E-posta" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <select value={editForm.role} onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))} className={inputCls}>
                          {ROLLER.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                        <input type="password" value={editForm.password} onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))} className={inputCls} placeholder="Yeni şifre (boş = değişmez)" />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--text)" }}>
                          <input type="checkbox" checked={editForm.active} onChange={(e) => setEditForm((p) => ({ ...p, active: e.target.checked }))} />
                          Aktif
                        </label>
                        <div className="flex gap-2">
                          <button onClick={saveEdit} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: "#22C55E20", color: "#22C55E" }}>
                            <Check size={13} /> Kaydet
                          </button>
                          <button onClick={() => setEditId(null)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs" style={{ color: "var(--text-muted)" }}>
                            <X size={13} /> İptal
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Normal satır */
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }}>
                        {u.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm" style={{ color: "var(--text)" }}>{u.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${roleBadge[u.role]}`}>
                            {ROLLER.find((r) => r.value === u.role)?.label ?? u.role}
                          </span>
                          {!u.active && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">Pasif</span>}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{u.email}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => startEdit(u)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5">
                          <Pencil size={13} style={{ color: "var(--text-muted)" }} />
                        </button>
                        <button onClick={() => del(u.id)} className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10">
                          <Trash2 size={13} className="hover:text-red-400" style={{ color: "var(--text-muted)" }} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
