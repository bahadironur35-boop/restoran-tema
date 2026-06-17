import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const images = [
  { src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", alt: "Restoran atmosferi" },
  { src: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80", alt: "Biftek tabağı" },
  { src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80", alt: "İç mekan" },
  { src: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80", alt: "Et yemeği" },
  { src: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80", alt: "Çorba" },
  { src: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800&q=80", alt: "Tatlı" },
  { src: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&q=80", alt: "Şef mutfakta" },
  { src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80", alt: "Şarap servisi" },
  { src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", alt: "Restoran masaları" },
];

export default function GaleriPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 px-6 min-h-screen bg-[#0F0F0F]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#C9A84C] tracking-widest uppercase text-sm mb-2">La Maison</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Galeri</h1>
            <div className="w-16 h-0.5 bg-[#C9A84C] mx-auto" />
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {images.map((img, i) => (
              <div key={i} className="break-inside-avoid overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
