"use client";
import { useState, useEffect } from "react";

const TABS = [
  { key: "marka",    label: "Marka & Tasarım" },
  { key: "anasayfa", label: "Ana Sayfa" },
  { key: "onecikan", label: "Öne Çıkan Yemekler" },
];

const MARKA_FIELDS = [
  { name: "logoUrl",       label: "Logo URL",          hint: "PNG/SVG önerilir. Boş bırakılırsa restoran adı gösterilir." },
];

const RENK_FIELDS = [
  { name: "brandColor",      label: "Ana Renk",     hint: "Buton, vurgu, fiyat rengi" },
  { name: "brandColorDark",  label: "Arka Plan",    hint: "Header ve sayfa zemini" },
  { name: "brandTextLight",  label: "Metin (Açık)", hint: "Koyu zemindeki yazılar" },
];

const HERO_FIELDS = [
  { name: "heroGorsel",  label: "Hero Görsel URL",  hint: "1920×1080 önerilir. Boş bırakılırsa varsayılan görüntü kullanılır." },
  { name: "heroSlogan",  label: "Üst Slogan",       hint: "Hero alanı üst küçük yazı (ör. Fine Dining Experience)" },
  { name: "heroBaslik",  label: "Ana Başlık",       hint: "İlk satır büyük başlık (ör. Lezzetin Sanatı)" },
  { name: "heroVurgu",   label: "Vurgulu Kelime",   hint: "Başlıktaki altın renkli kelime (ör. Sanatı)" },
  { name: "heroAltYazi", label: "Alt Yazı",         hint: "Hero açıklama metni" },
];

const OC_FIELDS = [
  { slot: 1, ad: "oneCikan1Ad", aciklama: "oneCikan1Aciklama", fiyat: "oneCikan1Fiyat", gorsel: "oneCikan1Gorsel" },
  { slot: 2, ad: "oneCikan2Ad", aciklama: "oneCikan2Aciklama", fiyat: "oneCikan2Fiyat", gorsel: "oneCikan2Gorsel" },
  { slot: 3, ad: "oneCikan3Ad", aciklama: "oneCikan3Aciklama", fiyat: "oneCikan3Fiyat", gorsel: "oneCikan3Gorsel" },
];

export default function IcerikClient() {
  const [tab, setTab] = useState("marka");
  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/ayarlar")
      .then((r) => r.json())
      .then((data) => { setForm(data); setLoading(false); });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    await fetch("/api/admin/ayarlar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputCls = "input-field w-full px-4 py-2.5 text-sm focus:outline-none transition-colors";

  const brandColor     = form.brandColor     || "#C9A84C";
  const brandColorDark = form.brandColorDark || "#0F0F0F";
  const logoUrl        = form.logoUrl        || "";
  const logoPozisyon   = form.logoPozisyon   || "orta";

  if (loading) return <p style={{ color: "var(--text-muted)" }}>Yükleniyor...</p>;

  return (
    <div className="max-w-2xl">
      {/* Tab bar */}
      <div className="flex gap-1 mb-8 p-1 rounded-xl" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
            style={tab === t.key
              ? { backgroundColor: "#1A73E8", color: "#fff" }
              : { color: "var(--text-muted)" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── MARKA ── */}
      {tab === "marka" && (
        <div className="space-y-6">
          <section className="card p-6 space-y-6">
            {/* Önizleme */}
            <div>
              <p className="text-xs uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Önizleme</p>
              <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-4 px-6 py-4" style={{ backgroundColor: brandColorDark }}>
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt="logo" className="h-8 object-contain"
                      style={{ marginLeft: logoPozisyon === "orta" ? "auto" : 0, marginRight: logoPozisyon === "orta" ? "auto" : 0 }} />
                  ) : (
                    <p className="font-bold tracking-widest uppercase text-sm w-full"
                      style={{ color: brandColor, textAlign: logoPozisyon === "orta" ? "center" : "left" }}>
                      {form.restaurantName || "Restoran Adı"}
                    </p>
                  )}
                </div>
                <div className="px-6 py-3 flex items-center gap-3" style={{ backgroundColor: brandColorDark, borderTop: `1px solid ${brandColor}22` }}>
                  {["Menü", "Sipariş Ver", "Çağır"].map((t, i) => (
                    <span key={t} className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={i === 0 ? { backgroundColor: brandColor, color: brandColorDark } : { color: "#888" }}>
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-center py-2" style={{ backgroundColor: "#111", color: "#555" }}>QR sayfa önizleme</p>
              </div>
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Logo URL</label>
              <input name="logoUrl" value={form.logoUrl ?? ""} onChange={handleChange} className={inputCls} placeholder="https://..." />
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>PNG/SVG önerilir. Boş bırakılırsa restoran adı yazı olarak gösterilir.</p>
            </div>

            {/* Logo pozisyonu */}
            <div>
              <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Logo Pozisyonu</label>
              <div className="flex gap-2">
                {["sol", "orta"].map((poz) => (
                  <button key={poz} type="button"
                    onClick={() => setForm((p) => ({ ...p, logoPozisyon: poz }))}
                    className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
                    style={logoPozisyon === poz
                      ? { backgroundColor: "#1A73E8", color: "#fff" }
                      : { backgroundColor: "var(--bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                    {poz === "sol" ? "◀ Sol" : "◆ Orta"}
                  </button>
                ))}
              </div>
            </div>

            {/* Renkler */}
            <div>
              <p className="text-xs uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Renkler</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {RENK_FIELDS.map((c) => (
                  <div key={c.name}>
                    <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>{c.label}</label>
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border flex-shrink-0" style={{ borderColor: "var(--border)" }}>
                        <input type="color" name={c.name} value={form[c.name] || "#000000"} onChange={handleChange}
                          className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                          style={{ width: "200%", height: "200%", top: "-50%", left: "-50%" }} />
                        <div className="w-full h-full rounded-lg" style={{ backgroundColor: form[c.name] || "#000000" }} />
                      </div>
                      <div className="flex-1">
                        <input name={c.name} value={form[c.name] ?? ""} onChange={handleChange} className={inputCls} placeholder="#000000" />
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{c.hint}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <button onClick={handleSave} className="btn-primary text-sm tracking-widest uppercase">
            {saved ? "Kaydedildi ✓" : "Kaydet"}
          </button>
        </div>
      )}

      {/* ── ANA SAYFA ── */}
      {tab === "anasayfa" && (
        <div className="space-y-6">
          <section className="card p-6 space-y-5">
            <h2 className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>Hero Alanı</h2>

            {HERO_FIELDS.map((f) => (
              <div key={f.name}>
                <label className="block text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>{f.label}</label>
                <input name={f.name} value={form[f.name] ?? ""} onChange={handleChange} className={inputCls} />
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{f.hint}</p>
              </div>
            ))}

            {/* Önizleme */}
            {(form.heroGorsel || form.heroBaslik) && (
              <div className="relative rounded-xl overflow-hidden h-48 mt-4" style={{ backgroundColor: "#111" }}>
                {form.heroGorsel && (
                  <div className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{ backgroundImage: `url('${form.heroGorsel}')` }} />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  {form.heroSlogan && (
                    <p className="text-xs tracking-widest uppercase mb-2" style={{ color: brandColor }}>{form.heroSlogan}</p>
                  )}
                  <p className="text-2xl font-bold" style={{ color: "#fff" }}>
                    {form.heroBaslik || "Ana Başlık"}
                    {form.heroVurgu && (
                      <span style={{ color: brandColor }}> {form.heroVurgu}</span>
                    )}
                  </p>
                  {form.heroAltYazi && (
                    <p className="text-sm mt-2 max-w-xs" style={{ color: "#aaa" }}>{form.heroAltYazi}</p>
                  )}
                </div>
                <p className="absolute bottom-0 left-0 right-0 text-xs text-center py-1" style={{ backgroundColor: "#00000080", color: "#555" }}>Önizleme</p>
              </div>
            )}
          </section>

          <button onClick={handleSave} className="btn-primary text-sm tracking-widest uppercase">
            {saved ? "Kaydedildi ✓" : "Kaydet"}
          </button>
        </div>
      )}

      {/* ── ÖNE ÇIKAN YEMEKLER ── */}
      {tab === "onecikan" && (
        <div className="space-y-6">
          {OC_FIELDS.map((oc) => (
            <section key={oc.slot} className="card p-6 space-y-4">
              <h2 className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>
                {oc.slot}. Yemek
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Adı</label>
                  <input name={oc.ad} value={form[oc.ad] ?? ""} onChange={handleChange} className="input-field w-full px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Fiyat</label>
                  <input name={oc.fiyat} value={form[oc.fiyat] ?? ""} onChange={handleChange} className="input-field w-full px-4 py-2.5 text-sm" placeholder="₺890" />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Açıklama</label>
                <input name={oc.aciklama} value={form[oc.aciklama] ?? ""} onChange={handleChange} className="input-field w-full px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Görsel URL</label>
                <input name={oc.gorsel} value={form[oc.gorsel] ?? ""} onChange={handleChange} className="input-field w-full px-4 py-2.5 text-sm" placeholder="https://..." />
                {form[oc.gorsel] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form[oc.gorsel]} alt="" className="mt-2 h-24 w-full object-cover rounded-lg" />
                )}
              </div>
            </section>
          ))}

          <button onClick={handleSave} className="btn-primary text-sm tracking-widest uppercase">
            {saved ? "Kaydedildi ✓" : "Kaydet"}
          </button>
        </div>
      )}
    </div>
  );
}
