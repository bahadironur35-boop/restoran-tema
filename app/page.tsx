import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "EatOs — Fine Dining Restaurant İstanbul",
  description: "İstanbul'un kalbinde eşsiz lezzetler ve zarif atmosfer. Michelin yıldızlı şef kadrosu, 200+ şarap çeşidi. Online rezervasyon yapın.",
  alternates: { canonical: "https://restoran-tema.vercel.app" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "EatOs",
  description: "İstanbul'un kalbinde fine dining deneyimi.",
  url: "https://restoran-tema.vercel.app",
  telephone: "+90-216-123-45-67",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bağdat Caddesi No: 123",
    addressLocality: "Kadıköy",
    addressRegion: "İstanbul",
    addressCountry: "TR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 40.9755,
    longitude: 29.0553,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "12:00",
      closes: "23:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday", "Sunday"],
      opens: "11:00",
      closes: "24:00",
    },
  ],
  servesCuisine: ["Fine Dining", "Türk Mutfağı", "Akdeniz"],
  priceRange: "₺₺₺₺",
  image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
  hasMap: "https://maps.google.com",
  reservations: "https://restoran-tema.vercel.app/rezervasyon",
  menu: "https://restoran-tema.vercel.app/menu",
};

const features = [
  { icon: "🍷", title: "Seçkin Şarap Listesi", desc: "Dünyanın dört bir yanından özenle seçilmiş 200+ şarap çeşidi." },
  { icon: "👨‍🍳", title: "Usta Şefler", desc: "Michelin yıldızlı mutfaklarda yetişmiş deneyimli şef kadromuz." },
  { icon: "🕯️", title: "Zarif Atmosfer", desc: "Özel anlarınız için tasarlanmış romantik ve şık iç mekan." },
  { icon: "📅", title: "Kolay Rezervasyon", desc: "Online rezervasyon ile masanızı saniyeler içinde ayırtın." },
];

const testimonials = [
  { name: "Ayşe K.", text: "Hayatımda yediğim en iyi akşam yemeği. Atmosfer muhteşem, servis kusursuz.", stars: 5 },
  { name: "Mehmet Y.", text: "Yıl dönümümüzü burada kutladık. Personel çok ilgiliydi, tekrar geleceğiz.", stars: 5 },
  { name: "Zeynep A.", text: "Her detay düşünülmüş. Şefin özel menüsünü mutlaka deneyin.", stars: 5 },
];

const PUBLIC_KEYS = [
  "restaurantName", "phone", "email", "address",
  "weekdayHours", "weekendHours",
  "tripadvisorUrl", "googleMapsUrl", "instagramHandle", "instagramPosts",
  "logoUrl", "logoPozisyon", "brandColor", "brandColorDark", "brandTextLight",
  "heroGorsel", "heroSlogan", "heroBaslik", "heroVurgu", "heroAltYazi",
  "oneCikan1Ad", "oneCikan1Aciklama", "oneCikan1Fiyat", "oneCikan1Gorsel",
  "oneCikan2Ad", "oneCikan2Aciklama", "oneCikan2Fiyat", "oneCikan2Gorsel",
  "oneCikan3Ad", "oneCikan3Aciklama", "oneCikan3Fiyat", "oneCikan3Gorsel",
];

async function getAyarlar() {
  try {
    const ayarlar = await prisma.ayar.findMany({ where: { key: { in: PUBLIC_KEYS } } });
    const obj: Record<string, string> = {};
    for (const a of ayarlar) obj[a.key] = a.value;
    return obj;
  } catch {
    return {};
  }
}

export default async function Home() {
  const ayarlar = await getAyarlar();
  const restaurantName  = ayarlar.restaurantName  || "EatOs";
  const phone           = ayarlar.phone           || "+90 216 123 45 67";
  const email           = ayarlar.email           || "";
  const address         = ayarlar.address         || "";
  const weekdayHours    = ayarlar.weekdayHours    || "12:00 – 23:00";
  const weekendHours    = ayarlar.weekendHours    || "11:00 – 24:00";
  const tripadvisorUrl  = ayarlar.tripadvisorUrl  || "";
  const googleMapsUrl   = ayarlar.googleMapsUrl   || "";
  const instagramHandle = ayarlar.instagramHandle || "";
  const brandColor      = ayarlar.brandColor      || "#C9A84C";
  const logoUrl         = ayarlar.logoUrl         || "";
  const logoPozisyon    = ayarlar.logoPozisyon    || "orta";
  const heroGorsel      = ayarlar.heroGorsel      || "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80";
  const heroSlogan      = ayarlar.heroSlogan      || "Fine Dining Experience";
  const heroBaslik      = ayarlar.heroBaslik      || "Lezzetin";
  const heroVurgu       = ayarlar.heroVurgu       || "Sanatı";
  const heroAltYazi     = ayarlar.heroAltYazi     || `Her tabak bir şaheser, her an bir anı. ${ayarlar.restaurantName || "EatOs"}'da unutulmaz bir yemek deneyimi sizi bekliyor.`;
  const OC_DEFAULTS = [
    { ad: "Wagyu Biftek",   aciklama: "A5 Japon Wagyu, trüf yağı, karamelize soğan", fiyat: "₺890", gorsel: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80" },
    { ad: "Homard Bisque",  aciklama: "Taze istakoz çorbası, krema, dereotu",         fiyat: "₺320", gorsel: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80" },
    { ad: "Tiramisu Royal", aciklama: "Ev yapımı tiramisu, espresso jölesi, kakao",   fiyat: "₺180", gorsel: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600&q=80" },
  ];
  const oneCikanlar = [1, 2, 3].map((i) => ({
    ad:       ayarlar[`oneCikan${i}Ad`]       || OC_DEFAULTS[i - 1].ad,
    aciklama: ayarlar[`oneCikan${i}Aciklama`] || OC_DEFAULTS[i - 1].aciklama,
    fiyat:    ayarlar[`oneCikan${i}Fiyat`]    || OC_DEFAULTS[i - 1].fiyat,
    gorsel:   ayarlar[`oneCikan${i}Gorsel`]   || OC_DEFAULTS[i - 1].gorsel,
  }));
  const instagramPosts  = ayarlar.instagramPosts
    ? ayarlar.instagramPosts.split(",").map((u) => u.trim()).filter(Boolean)
    : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar restaurantName={restaurantName} logoUrl={logoUrl} logoPozisyon={logoPozisyon} brandColor={brandColor} />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg)" }}>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url('${heroGorsel}')` }}
        />
        <div className="relative text-center px-6 max-w-3xl">
          {heroSlogan && (
            <p className="tracking-[0.4em] uppercase text-sm mb-4" style={{ color: "var(--gold)" }}>{heroSlogan}</p>
          )}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{ color: "var(--text)" }}>
            {heroBaslik}<br />
            <span style={{ color: "var(--gold)" }}>{heroVurgu}</span>
          </h1>
          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
            {heroAltYazi}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rezervasyon" className="btn-gold text-sm tracking-widest uppercase">
              Rezervasyon Yap
            </Link>
            <Link
              href="/menu"
              className="px-6 py-3 text-sm tracking-widest uppercase transition-colors"
              style={{ border: "1px solid var(--gold)", color: "var(--gold)" }}
            >
              Menüyü Gör
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6" style={{ backgroundColor: "var(--bg)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="tracking-widest uppercase text-sm mb-2" style={{ color: "var(--gold)" }}>Neden {restaurantName}?</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "var(--text)" }}>Farkımızı Keşfedin</h2>
            <div className="w-16 h-0.5 mx-auto mt-4" style={{ backgroundColor: "var(--gold)" }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f) => (
              <div key={f.title} className="p-8 text-center transition-colors" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-semibold mb-2" style={{ color: "var(--gold)" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="py-20 px-6" style={{ backgroundColor: "var(--bg-card)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="tracking-widest uppercase text-sm mb-2" style={{ color: "var(--gold)" }}>Mutfağımızdan</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "var(--text)" }}>Öne Çıkan Lezzetler</h2>
            <div className="w-16 h-0.5 mx-auto mt-4" style={{ backgroundColor: "var(--gold)" }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {oneCikanlar.map((dish) => (
              <div key={dish.ad} className="group overflow-hidden" style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}>
                <div className="overflow-hidden h-56">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dish.gorsel}
                    alt={dish.ad}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg" style={{ color: "var(--text)" }}>{dish.ad}</h3>
                    <span className="font-bold" style={{ color: "var(--gold)" }}>{dish.fiyat}</span>
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>{dish.aciklama}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/menu" className="btn-gold text-sm tracking-widest uppercase">
              Tüm Menüyü Gör
            </Link>
          </div>
        </div>
      </section>

      {/* Reservation CTA */}
      <section className="py-20 px-6" style={{ backgroundColor: "var(--gold)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Masanızı Ayırtın</h2>
          <p className="text-black/70 mb-8">Özel anlarınız için masanızı hemen rezerve edin. 24 saat içinde onay alırsınız.</p>
          <Link href="/rezervasyon" className="bg-black text-white px-8 py-4 text-sm tracking-widest uppercase hover:opacity-80 transition-opacity inline-block font-semibold">
            Şimdi Rezervasyon Yap
          </Link>
        </div>
      </section>

      {/* TripAdvisor */}
      {tripadvisorUrl && (
        <section className="py-16 px-6" style={{ backgroundColor: "var(--bg)" }}>
          <div className="max-w-3xl mx-auto text-center">
            <p className="tracking-widest uppercase text-sm mb-2" style={{ color: "var(--gold)" }}>Değerlendirmeler</p>
            <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--text)" }}>TripAdvisor&apos;da Bizi Bulun</h2>
            <div className="w-16 h-0.5 mx-auto mb-8" style={{ backgroundColor: "var(--gold)" }} />
            <div className="p-8 inline-flex flex-col items-center gap-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="text-5xl">🦉</div>
              <div className="flex gap-1 text-2xl" style={{ color: "#00aa6c" }}>★★★★★</div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>TripAdvisor&apos;da 5 yıldız değerlendirme</p>
              <a
                href={tripadvisorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold text-sm tracking-widest uppercase"
                style={{ backgroundColor: "#00aa6c" }}
              >
                TripAdvisor&apos;da İncele
              </a>
              <a
                href={`${tripadvisorUrl}#REVIEWS`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline transition-colors"
                style={{ color: "var(--gold)" }}
              >
                Yorum yaz →
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Instagram Feed */}
      {instagramPosts.length > 0 && (
        <section className="py-16 px-6" style={{ backgroundColor: "var(--bg-card)" }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <p className="tracking-widest uppercase text-sm mb-2" style={{ color: "var(--gold)" }}>
                {instagramHandle ? `@${instagramHandle}` : "Instagram"}
              </p>
              <h2 className="text-3xl font-bold" style={{ color: "var(--text)" }}>Bizi Instagram&apos;da Takip Edin</h2>
              <div className="w-16 h-0.5 mx-auto mt-4" style={{ backgroundColor: "var(--gold)" }} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {instagramPosts.slice(0, 8).map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-square overflow-hidden relative group flex items-center justify-center"
                  style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}
                >
                  <span className="text-4xl">📷</span>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: "var(--gold)", color: "#000" }}>
                    <span className="text-sm font-semibold">Instagram&apos;da Gör →</span>
                  </div>
                </a>
              ))}
            </div>
            {instagramHandle && (
              <div className="text-center mt-8">
                <a
                  href={`https://www.instagram.com/${instagramHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold text-sm tracking-widest uppercase"
                >
                  Instagram&apos;da Takip Et
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20 px-6" style={{ backgroundColor: "var(--bg)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="tracking-widest uppercase text-sm mb-2" style={{ color: "var(--gold)" }}>Misafir Yorumları</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "var(--text)" }}>Onlar Ne Diyor?</h2>
            <div className="w-16 h-0.5 mx-auto mt-4" style={{ backgroundColor: "var(--gold)" }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="p-8" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="flex gap-1 mb-4" style={{ color: "var(--gold)" }}>
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="italic mb-4" style={{ color: "var(--text-muted)" }}>&quot;{t.text}&quot;</p>
                <p className="font-semibold" style={{ color: "var(--gold)" }}>— {t.name}</p>
              </div>
            ))}
          </div>

          {tripadvisorUrl && (
            <div className="text-center mt-10">
              <a
                href={`${tripadvisorUrl}#REVIEWS`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm uppercase tracking-widest underline transition-colors"
                style={{ color: "var(--gold)" }}
              >
                TripAdvisor&apos;da tüm yorumları gör →
              </a>
            </div>
          )}
        </div>
      </section>

      <Footer restaurantName={restaurantName} address={address} phone={phone} email={email} weekdayHours={weekdayHours} weekendHours={weekendHours} brandColor={brandColor} />
    </>
  );
}
