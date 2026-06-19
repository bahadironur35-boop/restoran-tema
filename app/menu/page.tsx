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

async function getMenu() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/menu`, { cache: "no-store" });
    return res.ok ? res.json() : [];
  } catch { return []; }
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTema();
  const name = t.restaurantName || "EatOs";
  return {
    title: `Menü | ${name}`,
    description: `${name} menüsünü keşfedin.`,
  };
}

type MenuItem = { id: number; name: string; desc: string; price: string; category: string; image?: string; happyHourPrice?: string | null };

export default async function MenuPage() {
  const [t, items] = await Promise.all([getTema(), getMenu()]);

  const restaurantName = t.restaurantName || "EatOs";
  const logoUrl = t.logoUrl || "";
  const logoPozisyon = t.logoPozisyon || "orta";
  const brandColor = t.brandColor || "#C9A84C";
  const brandColorDark = t.brandColorDark || "#0F0F0F";
  const brandTextLight = t.brandTextLight || "#FFFFFF";
  const happyHourEtiket = t.happyHourEtiket || "Happy Hour";

  const isHappyHour = (() => {
    if (!t.happyHourBaslangic || !t.happyHourBitis) return false;
    const now = new Date();
    const [sh, sm] = (t.happyHourBaslangic as string).split(":").map(Number);
    const [eh, em] = (t.happyHourBitis as string).split(":").map(Number);
    const cur = now.getHours() * 60 + now.getMinutes();
    return cur >= sh * 60 + sm && cur < eh * 60 + em;
  })();

  // Kategoriye göre grupla
  const grouped: Record<string, MenuItem[]> = {};
  for (const item of items as MenuItem[]) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  }

  const hasItems = Object.keys(grouped).length > 0;

  return (
    <>
      <Navbar restaurantName={restaurantName} logoUrl={logoUrl} logoPozisyon={logoPozisyon} brandColor={brandColor} />
      <main className="pt-24 pb-20 px-6 min-h-screen" style={{ backgroundColor: brandColorDark }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="tracking-widest uppercase text-sm mb-2" style={{ color: brandColor }}>{restaurantName}</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: brandTextLight }}>Menümüz</h1>
            <div className="w-16 h-0.5 mx-auto" style={{ backgroundColor: brandColor }} />
            <p className="text-gray-400 mt-6 max-w-lg mx-auto">
              Tüm malzemelerimiz günlük taze temin edilmekte, mevsim ürünleri ön planda tutulmaktadır.
            </p>
          </div>

          {isHappyHour && (
            <div className="text-center mb-10 py-3 rounded-lg font-semibold text-sm" style={{ backgroundColor: "#78350F", color: "#FCD34D" }}>
              ⚡ {happyHourEtiket} — Seçili ürünlerde indirimli fiyatlar geçerli!
            </div>
          )}

          {!hasItems ? (
            <p className="text-center text-gray-500 py-20">Menü yakında eklenecek.</p>
          ) : (
            Object.entries(grouped).map(([category, catItems]) => (
              <div key={category} className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-2xl font-bold uppercase tracking-wider" style={{ color: brandColor }}>{category}</h2>
                  <div className="flex-1 h-px bg-[#2A2A2A]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {catItems.map((item) => (
                    <div key={item.id} className="flex justify-between gap-4 p-6 bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] transition-colors">
                      <div>
                        <h3 className="font-semibold mb-1" style={{ color: brandTextLight }}>{item.name}</h3>
                        <p className="text-gray-400 text-sm">{item.desc}</p>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        {isHappyHour && item.happyHourPrice ? (
                          <>
                            <span className="font-bold block" style={{ color: "#F59E0B" }}>⚡ {item.happyHourPrice}</span>
                            <span className="text-xs line-through text-gray-500">{item.price}</span>
                          </>
                        ) : (
                          <span className="font-bold" style={{ color: brandColor }}>{item.price}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          <p className="text-center text-gray-500 text-sm mt-8">
            Alerji bilgisi için lütfen personelimize danışınız. Fiyatlara KDV dahildir.
          </p>
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
