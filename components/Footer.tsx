import Link from "next/link";

type Props = {
  restaurantName?: string;
  address?: string;
  phone?: string;
  email?: string;
  weekdayHours?: string;
  weekendHours?: string;
  brandColor?: string;
};

export default function Footer({
  restaurantName = "EatOs",
  address = "",
  phone = "",
  email = "",
  weekdayHours = "12:00 – 23:00",
  weekendHours = "11:00 – 24:00",
  brandColor = "#C9A84C",
}: Props) {
  return (
    <footer className="bg-black border-t border-[#2A2A2A] text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-lg font-bold tracking-widest uppercase mb-3" style={{ color: brandColor }}>{restaurantName}</h3>
          <p>Eşsiz lezzetler ve zarif atmosfer ile unutulmaz bir yemek deneyimi sunan restoranımıza hoş geldiniz.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-xs">Hızlı Bağlantılar</h4>
          <ul className="space-y-2">
            {[["Menü", "/menu"], ["Rezervasyon", "/rezervasyon"], ["Galeri", "/galeri"], ["İletişim", "/iletisim"]].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="transition-colors hover:opacity-80" style={{ color: "inherit" }}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-xs">İletişim</h4>
          {address && <p>{address}</p>}
          {phone   && <p className="mt-2">{phone}</p>}
          {email   && <p>{email}</p>}
          <p className="mt-2">Pzt–Cum: {weekdayHours}</p>
          <p>Cmt–Pzr: {weekendHours}</p>
        </div>
      </div>
      <div className="border-t border-[#2A2A2A] text-center py-4 text-xs text-gray-600">
        © {new Date().getFullYear()} {restaurantName}. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
