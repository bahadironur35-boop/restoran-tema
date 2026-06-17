import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const menuData = {
  "Başlangıçlar": [
    { name: "Trüf Mantarlı Bruschetta", desc: "El yapımı ekmek, trüf yağı, cherry domates", price: "₺195" },
    { name: "Hamsi Ceviche", desc: "Taze hamsi, lime, avokado, kişniş", price: "₺240" },
    { name: "Foie Gras", desc: "Kaz ciğeri, incir reçeli, brioche", price: "₺380" },
    { name: "Homard Bisque", desc: "Istakoz çorbası, krema, dereotu", price: "₺320" },
  ],
  "Ana Yemekler": [
    { name: "Wagyu Biftek", desc: "A5 Japon Wagyu, trüf yağı, karamelize soğan", price: "₺890" },
    { name: "Levrek En Papillote", desc: "Fırın levrek, sebze julienne, limon tereyağı", price: "₺520" },
    { name: "Kuzu Rack", desc: "Pistachio kabuklu kuzu pirzola, ratatouille", price: "₺680" },
    { name: "Mantarlı Risotto", desc: "Porcini mantar, parmesan, beyaz şarap", price: "₺380" },
  ],
  "Tatlılar": [
    { name: "Tiramisu Royal", desc: "Ev yapımı tiramisu, espresso jölesi, kakao", price: "₺180" },
    { name: "Crème Brûlée", desc: "Vanilyalı krema, karamelize şeker kabuğu", price: "₺160" },
    { name: "Çikolatalı Fondant", desc: "Sıvı çikolata kalpli kek, vanilyalı dondurma", price: "₺195" },
    { name: "Meyve Tabağı", desc: "Mevsim meyveleri, bal, nane", price: "₺140" },
  ],
  "İçecekler": [
    { name: "Şarap (Kadeh)", desc: "Günün şarabı — kırmızı veya beyaz", price: "₺180" },
    { name: "Ev Limonata", desc: "Taze sıkılmış limon, nane, zencefil", price: "₺85" },
    { name: "Türk Kahvesi", desc: "Geleneksel pişirim, lokum ile", price: "₺65" },
    { name: "Espresso", desc: "Tek veya çift", price: "₺55" },
  ],
};

export default function MenuPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 px-6 min-h-screen bg-[#0F0F0F]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#C9A84C] tracking-widest uppercase text-sm mb-2">La Maison</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Menümüz</h1>
            <div className="w-16 h-0.5 bg-[#C9A84C] mx-auto" />
            <p className="text-gray-400 mt-6 max-w-lg mx-auto">
              Tüm malzemelerimiz günlük taze temin edilmekte, mevsim ürünleri ön planda tutulmaktadır.
            </p>
          </div>

          {Object.entries(menuData).map(([category, items]) => (
            <div key={category} className="mb-16">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl font-bold text-[#C9A84C] uppercase tracking-wider">{category}</h2>
                <div className="flex-1 h-px bg-[#2A2A2A]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.map((item) => (
                  <div key={item.name} className="flex justify-between gap-4 p-6 bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#C9A84C] transition-colors">
                    <div>
                      <h3 className="font-semibold text-white mb-1">{item.name}</h3>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                    <span className="text-[#C9A84C] font-bold whitespace-nowrap">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <p className="text-center text-gray-500 text-sm mt-8">
            Alerji bilgisi için lütfen personelimize danışınız. Fiyatlara KDV dahildir.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
