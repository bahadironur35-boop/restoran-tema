import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-[#2A2A2A] text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-[#C9A84C] text-lg font-bold tracking-widest uppercase mb-3">La Maison</h3>
          <p>Eşsiz lezzetler ve zarif atmosfer ile unutulmaz bir yemek deneyimi sunan fine dining restoranımıza hoş geldiniz.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-xs">Hızlı Bağlantılar</h4>
          <ul className="space-y-2">
            {[["Menü", "/menu"], ["Rezervasyon", "/rezervasyon"], ["Galeri", "/galeri"], ["İletişim", "/iletisim"]].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="hover:text-[#C9A84C] transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-xs">İletişim</h4>
          <p>Bağdat Caddesi No: 123</p>
          <p>Kadıköy, İstanbul</p>
          <p className="mt-2">+90 216 123 45 67</p>
          <p>info@lamaison.com.tr</p>
          <p className="mt-2">Pzt–Cum: 12:00 – 23:00</p>
          <p>Cmt–Pzr: 11:00 – 24:00</p>
        </div>
      </div>
      <div className="border-t border-[#2A2A2A] text-center py-4 text-xs text-gray-600">
        © {new Date().getFullYear()} La Maison. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
