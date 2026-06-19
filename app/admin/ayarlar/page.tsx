"use client";
import { useState, useEffect, useRef } from "react";

const SWITCH_SECTIONS = [
  {
    section: "Müşteri QR Sayfası",
    fields: [
      {
        name: "qrSiparisAktif",
        label: "QR ile Sipariş",
        desc: "Müşteriler QR okutarak kendi siparişlerini verebilsin (kapalıysa sadece garson alır)",
      },
      {
        name: "qrMasaTalebiAktif",
        label: "Garson / Hesap Çağırma",
        desc: "QR sayfasında garson çağır ve hesap iste butonları görünsün",
      },
      {
        name: "qrFiyatGoster",
        label: "Menüde Fiyat Göster",
        desc: "QR menüsünde ürün fiyatları müşteriye gösterilsin",
      },
      {
        name: "qrSiparisNotuAktif",
        label: "Sipariş Notu",
        desc: "Müşteri sipariş verirken not ekleyebilsin",
      },
      {
        name: "musteriSiparisHazirBildirimi",
        label: "Sipariş Hazır Bildirimi",
        desc: "Sipariş hazır olduğunda QR sayfasında müşteriye bildirim göster",
      },
    ],
  },
  {
    section: "Sipariş & Mutfak",
    fields: [
      {
        name: "kdsAktif",
        label: "KDS (Mutfak Ekranı)",
        desc: "Mutfak sipariş takip ekranı aktif olsun",
      },
      {
        name: "stokOtomatikDusme",
        label: "Stok Otomatik Düşme",
        desc: "Sipariş verildiğinde bağlı stok kalemleri otomatik azaltılsın",
      },
      {
        name: "paketSiparisAktif",
        label: "Paket / Gel-Al Sipariş",
        desc: "POS ekranında masasız paket sipariş oluşturma seçeneği görünsün",
      },
    ],
  },
  {
    section: "Modüller",
    fields: [
      {
        name: "rezervasyonAktif",
        label: "Rezervasyon",
        desc: "Rezervasyon alma ve yönetim ekranı aktif olsun",
      },
      {
        name: "crmAktif",
        label: "Müşteri CRM",
        desc: "Müşteri veritabanı ve geçmiş takibi aktif olsun",
      },
      {
        name: "stokAktif",
        label: "Stok Takibi",
        desc: "Stok yönetimi ve uyarı sistemi aktif olsun",
      },
      {
        name: "galeriAktif",
        label: "Galeri",
        desc: "Fotoğraf galerisi yönetimi aktif olsun",
      },
      {
        name: "raporlarAktif",
        label: "Raporlar",
        desc: "Satış raporları ve CSV export aktif olsun",
      },
      {
        name: "kasaAktif",
        label: "Kasa / Ödeme Al",
        desc: "Masadan ödeme alma ve kasa ekranı aktif olsun",
      },
      {
        name: "rbacAktif",
        label: "Kullanıcı Rolleri (RBAC)",
        desc: "Garson/şef/müdür rol sistemi aktif olsun. Kapalıysa herkes admin paneline tam erişir",
      },
      {
        name: "mailBildirimiAktif",
        label: "Mail Bildirimleri",
        desc: "Rezervasyon hatırlatma ve stok uyarı mailleri gönderilsin",
      },
    ],
  },
  {
    section: "Ödeme Yöntemleri",
    fields: [
      {
        name: "odemeNakit",
        label: "Nakit",
        desc: "Kasada nakit ödeme seçeneği görünsün",
      },
      {
        name: "odemeKart",
        label: "Kredi / Banka Kartı",
        desc: "Kasada kart ödeme seçeneği görünsün",
      },
      {
        name: "odemeHavale",
        label: "Havale / EFT",
        desc: "Kasada havale ödeme seçeneği görünsün",
      },
    ],
  },
];

const FIELDS = [
  { section: "Restoran Bilgileri", items: [
    { name: "restaurantName", label: "Restoran Adı", default: "EatOs" },
    { name: "phone", label: "Telefon", default: "+90 216 123 45 67" },
    { name: "email", label: "E-posta", default: "info@lamaison.com.tr" },
    { name: "address", label: "Adres", default: "Bağdat Caddesi No: 123, Kadıköy, İstanbul" },
    { name: "weekdayHours", label: "Hafta İçi Saatler", default: "12:00 – 23:00" },
    { name: "weekendHours", label: "Hafta Sonu Saatler", default: "11:00 – 24:00" },
  ]},
  { section: "Sosyal Medya & Değerlendirme", items: [
    { name: "tripadvisorUrl", label: "TripAdvisor Profil URL", default: "" },
    { name: "googleMapsUrl", label: "Google Maps Yorum URL", default: "" },
    { name: "instagramHandle", label: "Instagram Kullanıcı Adı (@ olmadan)", default: "" },
    { name: "instagramPosts", label: "Instagram Post URL'leri (virgülle ayır)", default: "" },
  ]},
  { section: "Rezervasyon Ayarları", items: [
    { name: "rezervasyonSaatleri", label: "Rezervasyon Saatleri (virgülle ayır)", default: "12:00,12:30,13:00,13:30,19:00,19:30,20:00,20:30,21:00,21:30" },
    { name: "rezervasyonMaksKisi", label: "Maksimum Kişi Sayısı", default: "8" },
  ]},
  { section: "Happy Hour", items: [
    { name: "happyHourBaslangic", label: "Başlangıç Saati (örn. 17:00)", default: "" },
    { name: "happyHourBitis", label: "Bitiş Saati (örn. 19:00)", default: "" },
    { name: "happyHourEtiket", label: "Etiket Metni", default: "Happy Hour" },
  ]},
  { section: "E-posta Ayarları", items: [
    { name: "resendApiKey", label: "Resend API Key", default: "" },
    { name: "fromEmail", label: "Gönderen E-posta", default: "noreply@lamaison.com.tr" },
  ]},
];

export default function AyarlarPage() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [embedKopyalandi, setEmbedKopyalandi] = useState(false);
  const originRef = useRef("");

  useEffect(() => { originRef.current = window.location.origin; }, []);

  useEffect(() => {
    fetch("/api/admin/ayarlar")
      .then((r) => r.json())
      .then((data) => {
        const defaults: Record<string, string> = {};
        for (const s of FIELDS) for (const f of s.items) defaults[f.name] = f.default;
        setForm({ ...defaults, ...data });
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/ayarlar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputCls = "input-field w-full px-4 py-2.5 text-sm focus:outline-none transition-colors";

  if (loading) return <p style={{ color: "var(--text-muted)" }}>Yükleniyor...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--text)" }}>Ayarlar</h1>
      <p className="text-sm mb-6 p-3 rounded-lg" style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
        💡 Logo, renkler ve sayfa içerikleri için{" "}
        <a href="/admin/icerik" className="underline" style={{ color: "#1A73E8" }}>İçerik Yönetimi</a>&apos;ni kullanın.
      </p>
      <form onSubmit={handleSave} className="space-y-8">

        {/* Bölümler */}
        {FIELDS.map((section) => (
          <section key={section.section} className="card p-6 space-y-4">
            <h2 className="uppercase tracking-wider text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>
              {section.section}
            </h2>
            {section.items.map((f) => (
              <div key={f.name}>
                <label className="block text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>{f.label}</label>
                {f.name === "instagramPosts" ? (
                  <textarea name={f.name} value={form[f.name] ?? ""} onChange={handleChange}
                    rows={3} className={inputCls}
                    placeholder="https://www.instagram.com/p/ABC123/, https://..." />
                ) : (
                  <input name={f.name}
                    type={f.name.toLowerCase().includes("key") || f.name.toLowerCase().includes("password") ? "password" : "text"}
                    value={form[f.name] ?? ""} onChange={handleChange} className={inputCls} />
                )}
              </div>
            ))}
          </section>
        ))}

        <button type="submit" className="btn-primary text-sm tracking-widest uppercase">
          {saved ? "Kaydedildi ✓" : "Kaydet"}
        </button>
      </form>

      {/* Switch ayarları */}
      <div className="mt-8 space-y-6">
        {SWITCH_SECTIONS.map((sec) => (
          <section key={sec.section} className="card p-6">
            <h2 className="uppercase tracking-wider text-sm font-semibold mb-4" style={{ color: "var(--text)" }}>
              {sec.section}
            </h2>
            <div className="space-y-1">
              {sec.fields.map((f, i) => (
                <div key={f.name}
                  className={`flex items-center justify-between gap-4 py-3 ${i < sec.fields.length - 1 ? "border-b" : ""}`}
                  style={{ borderColor: "var(--border)" }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{f.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{f.desc}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form[f.name] === "true"}
                    onClick={async () => {
                      const yeniDeger = form[f.name] === "true" ? "false" : "true";
                      setForm((p) => ({ ...p, [f.name]: yeniDeger }));
                      await fetch("/api/admin/ayarlar", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...form, [f.name]: yeniDeger }),
                      });
                    }}
                    className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200"
                    style={{ backgroundColor: form[f.name] === "true" ? "#1A73E8" : "var(--border)" }}
                  >
                    <span
                      className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
                      style={{ transform: form[f.name] === "true" ? "translateX(20px)" : "translateX(0)" }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Rezervasyon Widget Embed Kodu */}
      <div className="mt-8">
        <section className="card p-6 space-y-4">
          <div>
            <h2 className="uppercase tracking-wider text-sm font-semibold" style={{ color: "var(--text)" }}>
              Rezervasyon Widget
            </h2>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Bu kodu kendi web sitenize yapıştırarak rezervasyon formunu gömebilirsiniz.
            </p>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: "var(--bg)" }}>
              <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>HTML</span>
              <button
                onClick={() => {
                  const kod = `<iframe\n  src="${originRef.current}/rezervasyon/embed"\n  width="100%"\n  height="700"\n  frameborder="0"\n  style="border-radius:12px;border:1px solid #e2e8f0;"\n  title="Rezervasyon"\n></iframe>`;
                  navigator.clipboard.writeText(kod);
                  setEmbedKopyalandi(true);
                  setTimeout(() => setEmbedKopyalandi(false), 2000);
                }}
                className="text-xs px-3 py-1 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: embedKopyalandi ? "#16A34A20" : "var(--bg-card)", color: embedKopyalandi ? "#16A34A" : "var(--text-muted)", border: "1px solid var(--border)" }}>
                {embedKopyalandi ? "Kopyalandı ✓" : "Kopyala"}
              </button>
            </div>
            <pre className="px-4 py-3 text-xs overflow-x-auto" style={{ backgroundColor: "var(--bg-card)", color: "#22C55E" }}>
{`<iframe
  src="${originRef.current || "https://siteniz.com"}/rezervasyon/embed"
  width="100%"
  height="700"
  frameborder="0"
  style="border-radius:12px;border:1px solid #e2e8f0;"
  title="Rezervasyon"
></iframe>`}
            </pre>
          </div>
          <a href="/rezervasyon/embed" target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-medium"
            style={{ color: "#1A73E8" }}>
            ↗ Önizlemeyi aç
          </a>
        </section>
      </div>
    </div>
  );
}
