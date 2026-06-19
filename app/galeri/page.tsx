import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

async function getTema() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/tema`, { cache: "no-store" });
    return res.ok ? res.json() : {};
  } catch { return {}; }
}

async function getGaleri() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/galeri`, { cache: "no-store" });
    return res.ok ? res.json() : [];
  } catch { return []; }
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTema();
  const name = t.restaurantName || "EatOs";
  return {
    title: `Galeri | ${name}`,
    description: `${name} restoranının atmosferini fotoğraflarla keşfedin.`,
  };
}

type GaleriItem = { id: number; url: string; alt: string };

export default async function GaleriPage() {
  const [t, galeriItems] = await Promise.all([getTema(), getGaleri()]);

  const restaurantName = t.restaurantName || "EatOs";
  const logoUrl = t.logoUrl || "";
  const logoPozisyon = t.logoPozisyon || "orta";
  const brandColor = t.brandColor || "#C9A84C";
  const brandColorDark = t.brandColorDark || "#0F0F0F";
  const brandTextLight = t.brandTextLight || "#FFFFFF";

  const hasImages = (galeriItems as GaleriItem[]).length > 0;

  return (
    <>
      <Navbar restaurantName={restaurantName} logoUrl={logoUrl} logoPozisyon={logoPozisyon} brandColor={brandColor} />
      <main className="pt-24 pb-20 px-6 min-h-screen" style={{ backgroundColor: brandColorDark }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="tracking-widest uppercase text-sm mb-2" style={{ color: brandColor }}>{restaurantName}</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: brandTextLight }}>Galeri</h1>
            <div className="w-16 h-0.5 mx-auto" style={{ backgroundColor: brandColor }} />
          </div>

          {!hasImages ? (
            <p className="text-center text-gray-500 py-20">Fotoğraflar yakında eklenecek.</p>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
              {(galeriItems as GaleriItem[]).map((img) => (
                <div key={img.id} className="break-inside-avoid overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer
        restaurantName={restaurantName}
        address={t.address || ""}
        phone={t.phone || ""}
        email={t.email || ""}
        weekdayHours={t.weekdayHours || ""}
        weekendHours={t.weekendHours || ""}
        brandColor={brandColor}
      />
    </>
  );
}
