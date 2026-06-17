import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

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

export default function Home() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center bg-[#0F0F0F]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80')" }}
        />
        <div className="relative text-center px-6 max-w-3xl">
          <p className="text-[#C9A84C] tracking-[0.4em] uppercase text-sm mb-4">Fine Dining Experience</p>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Lezzetin<br />
            <span className="text-[#C9A84C]">Sanatı</span>
          </h1>
          <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto">
            Her tabak bir şaheser, her an bir anı. La Maison&apos;da unutulmaz bir yemek deneyimi sizi bekliyor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rezervasyon" className="btn-primary text-sm tracking-widest uppercase">
              Rezervasyon Yap
            </Link>
            <Link
              href="/menu"
              className="border border-[#C9A84C] text-[#C9A84C] px-6 py-3 text-sm tracking-widest uppercase hover:bg-[#C9A84C] hover:text-black transition-colors"
            >
              Menüyü Gör
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-[#0F0F0F]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#C9A84C] tracking-widest uppercase text-sm mb-2">Neden La Maison?</p>
            <h2 className="text-3xl md:text-4xl font-bold">Farkımızı Keşfedin</h2>
            <div className="w-16 h-0.5 bg-[#C9A84C] mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f) => (
              <div key={f.title} className="bg-[#1A1A1A] border border-[#2A2A2A] p-8 text-center hover:border-[#C9A84C] transition-colors">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-[#C9A84C] font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="py-20 px-6 bg-[#111]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#C9A84C] tracking-widest uppercase text-sm mb-2">Mutfağımızdan</p>
            <h2 className="text-3xl md:text-4xl font-bold">Öne Çıkan Lezzetler</h2>
            <div className="w-16 h-0.5 bg-[#C9A84C] mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Wagyu Biftek", desc: "A5 Japon Wagyu, trüf yağı, karamelize soğan", price: "₺890", img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80" },
              { name: "Homard Bisque", desc: "Taze istakoz çorbası, krema, dereotu", price: "₺320", img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80" },
              { name: "Tiramisu Royal", desc: "Ev yapımı tiramisu, espresso jölesi, kakao", price: "₺180", img: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600&q=80" },
            ].map((dish) => (
              <div key={dish.name} className="group overflow-hidden bg-[#1A1A1A] border border-[#2A2A2A]">
                <div className="overflow-hidden h-56">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dish.img}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{dish.name}</h3>
                    <span className="text-[#C9A84C] font-bold">{dish.price}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{dish.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/menu" className="btn-primary text-sm tracking-widest uppercase">
              Tüm Menüyü Gör
            </Link>
          </div>
        </div>
      </section>

      {/* Reservation CTA */}
      <section className="py-20 px-6 bg-[#C9A84C]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Masanızı Ayırtın</h2>
          <p className="text-black/70 mb-8">Özel anlarınız için masanızı hemen rezerve edin. 24 saat içinde onay alırsınız.</p>
          <Link href="/rezervasyon" className="bg-black text-white px-8 py-4 text-sm tracking-widest uppercase hover:bg-[#1A1A1A] transition-colors inline-block font-semibold">
            Şimdi Rezervasyon Yap
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-[#0F0F0F]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#C9A84C] tracking-widest uppercase text-sm mb-2">Misafir Yorumları</p>
            <h2 className="text-3xl md:text-4xl font-bold">Onlar Ne Diyor?</h2>
            <div className="w-16 h-0.5 bg-[#C9A84C] mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-[#1A1A1A] border border-[#2A2A2A] p-8">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <span key={i} className="text-[#C9A84C]">★</span>
                  ))}
                </div>
                <p className="text-gray-300 italic mb-4">&quot;{t.text}&quot;</p>
                <p className="text-[#C9A84C] font-semibold">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
