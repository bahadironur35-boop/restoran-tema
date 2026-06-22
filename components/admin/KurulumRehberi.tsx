"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink, CheckSquare, Square } from "lucide-react";

const CHECKLIST: { baslik: string; sure: string; zorunlu: boolean; detay: string }[] = [
  { baslik: "Neon'da yeni veritabanı aç", sure: "5 dk", zorunlu: true, detay: "neon.tech → New Project → müşteri adını ver → Connection string'i kopyala" },
  { baslik: "Vercel'de yeni proje aç", sure: "5 dk", zorunlu: true, detay: "vercel.com → Add New Project → restoran-tema reposunu seç → DATABASE_URL ve ADMIN_PASSWORD ekle → Deploy" },
  { baslik: "Veritabanı tablolarını oluştur", sure: "3 dk", zorunlu: true, detay: "C:\\projeler\\restoran-tema klasöründe .env'ye müşterinin DATABASE_URL'ini yaz → npx prisma db push → sonra .env'yi eski haline getir" },
  { baslik: "Sisteme gir, temel ayarları yap", sure: "10 dk", zorunlu: true, detay: "yeni-proje.vercel.app/login → Ayarlar → Restoran adı, telefon, adres, çalışma saatleri → Modülleri işletmeye göre aç/kapat" },
  { baslik: "Masaları ekle", sure: "10 dk", zorunlu: true, detay: "Admin → Masa & QR → her masa için numara, kapasite, alan gir → Masa Planı'nda yerleştir" },
  { baslik: "Menüyü gir", sure: "1-2 saat", zorunlu: true, detay: "Admin → Menü Yönetimi → kategoriler ve ürünler → müşteriyle birlikte yaparsan daha hızlı olur" },
  { baslik: "QR kodları yazdır", sure: "15 dk", zorunlu: true, detay: "Masa & QR → her masanın QR ikonuna tıkla → PNG indir → yazdır, laminasyon yaptır" },
  { baslik: "Domain bağla", sure: "15 dk", zorunlu: false, detay: "Vercel → Settings → Domains → müşterinin domain'ini ekle → DNS ayarlarını müşterinin sağlayıcısında güncelle" },
  { baslik: "Uçtan uca test yap", sure: "20 dk", zorunlu: true, detay: "Telefonla QR oku → sipariş ver → kasadan öde → masanın boşa döndüğünü gör → her şey tamam ise müşteriye şifreyi teslim et" },
  { baslik: "Web Push kur (bildirimler açıksa)", sure: "5 dk", zorunlu: false, detay: "VAPID anahtarları oluştur → Vercel'e ekle → Ayarlar → Web Push Bildirimleri aç" },
  { baslik: "Online ödeme kur (isteniyorsa)", sure: "1-2 gün", zorunlu: false, detay: "İyzico başvurusu yap (onay 1-2 gün sürer) → API anahtarlarını Vercel'e ekle → Ayarlar → Online Ödeme aç" },
];

type Adim = {
  baslik: string;
  sure: string;
  zorunlu: boolean;
  aciklama: string;
  adimlar: string[];
  notlar?: string[];
  link?: { label: string; url: string };
};

type Bolum = {
  no: number;
  baslik: string;
  ozet: string;
  renk: string;
  adimlar: Adim[];
};

const BOLUMLER: Bolum[] = [
  {
    no: 1,
    baslik: "Veritabanı Kurulumu",
    ozet: "Her işletme kendi veritabanında çalışmalı. Veriler birbirinden tamamen izole olur.",
    renk: "#1A73E8",
    adimlar: [
      {
        baslik: "Neon hesabı aç",
        sure: "5 dk",
        zorunlu: true,
        aciklama: "Neon, ücretsiz PostgreSQL veritabanı sağlıyor. Her işletme için ayrı proje aç.",
        adimlar: [
          "neon.tech adresine git ve ücretsiz hesap oluştur",
          "Dashboard'dan 'New Project' tıkla",
          "Proje adı: işletme adı (örn: lamaison-db)",
          "Region olarak 'Europe West' seç — Türkiye'ye en yakın",
          "Oluşturunca Connection String'i kopyala (postgresql://...)",
        ],
        link: { label: "neon.tech", url: "https://neon.tech" },
      },
      {
        baslik: "Veritabanı şemasını kur",
        sure: "3 dk",
        zorunlu: true,
        aciklama: "Projeyi klonladıktan sonra tek komutla tüm tablolar oluşur.",
        adimlar: [
          "Projeyi bilgisayarına klonla: git clone <repo-url>",
          ".env dosyası oluştur: DATABASE_URL=<neon-connection-string>",
          "Terminal'de çalıştır: npx prisma db push",
          "'All migrations applied' mesajını gör — tablolar hazır",
        ],
        notlar: [
          "npx prisma migrate dev yerine db push kullan — Neon'un ücretsiz planında advisory lock sorunu çıkabiliyor",
        ],
      },
    ],
  },
  {
    no: 2,
    baslik: "Vercel Deploy",
    ozet: "Her işletme için ayrı Vercel projesi. Böylece bağımsız ortam değişkenleri ve domain olur.",
    renk: "#8B5CF6",
    adimlar: [
      {
        baslik: "Yeni Vercel projesi oluştur",
        sure: "5 dk",
        zorunlu: true,
        aciklama: "GitHub reposunu import et, ortam değişkenlerini ekle, deploy et.",
        adimlar: [
          "vercel.com'a git → 'Add New Project'",
          "GitHub reposunu seç",
          "Environment Variables bölümüne gir (zorunlular):",
          "  DATABASE_URL → Neon connection string",
          "  ADMIN_PASSWORD → işletme için güçlü şifre belirle",
          "İsteğe bağlı env var'lar (ilgili modüller açıksa ekle):",
          "  CRON_SECRET → rastgele güçlü string (cron güvenliği için)",
          "  VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY + VAPID_SUBJECT → Web Push",
          "  IYZICO_API_KEY + IYZICO_SECRET_KEY + IYZICO_ENV → İyzico ödemesi",
          "  STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET → Stripe ödemesi",
          "  ODEME_PROVIDER → iyzico veya stripe",
          "'Deploy' tıkla — ilk build ~2 dakika sürer",
          "Deploy tamamlanınca .vercel.app URL'i test et",
        ],
        notlar: [
          "ADMIN_PASSWORD'u işletmeye teslim et, sende kayıtlı tutma",
          "Her işletme farklı şifre kullanmalı",
        ],
      },
      {
        baslik: "Ortam değişkenlerini doğrula",
        sure: "2 dk",
        zorunlu: true,
        aciklama: "/login sayfasına gir, şifre ile giriş yap ve dashboard'un açıldığını doğrula.",
        adimlar: [
          "deploy-url.vercel.app/login adresine git",
          "Belirlediğin şifre ile giriş yap",
          "Dashboard açılıyorsa her şey doğru",
          "Açılmıyorsa Vercel → Settings → Environment Variables'ı kontrol et",
        ],
      },
    ],
  },
  {
    no: 3,
    baslik: "Domain Bağlama",
    ozet: "İşletmenin kendi domaini varsa Vercel'e bağla. Yoksa .vercel.app subdomain yeterli.",
    renk: "#16A34A",
    adimlar: [
      {
        baslik: "Domain satın al (gerekiyorsa)",
        sure: "10 dk",
        zorunlu: false,
        aciklama: "İşletmenin domain'i yoksa Namecheap veya Google Domains'ten alabilirsin.",
        adimlar: [
          "namecheap.com veya domains.google.com'dan uygun domain ara",
          "Genellikle yıllık 100-200 TL arası",
          "Satın alınca DNS ayarlarına erişim için panel şifresini al",
        ],
        notlar: [
          "Alt domain de olabilir: pos.lamaison.com.tr gibi",
          "İşletmenin kendi sitesi varsa sub-domain tercih et",
        ],
      },
      {
        baslik: "Vercel'e domain ekle",
        sure: "5 dk",
        zorunlu: false,
        aciklama: "Vercel otomatik SSL sertifikası oluşturur, HTTPS ücretsiz.",
        adimlar: [
          "Vercel'de projeyi aç → Settings → Domains",
          "'Add Domain' ile işletmenin domainini gir",
          "Vercel'in verdiği A veya CNAME record'u kopyala",
          "Domain sağlayıcının DNS panelinden bu record'u ekle",
          "Yayılma 5-30 dakika sürebilir",
          "Vercel 'Valid Configuration' gösterince tamamdır",
        ],
      },
    ],
  },
  {
    no: 4,
    baslik: "Restoran Ayarları",
    ozet: "Admin panelde işletmeye ait bilgileri doldur. Bunlar public sayfada ve e-postalarda görünür.",
    renk: "#F59E0B",
    adimlar: [
      {
        baslik: "Temel bilgileri gir",
        sure: "5 dk",
        zorunlu: true,
        aciklama: "Ayarlar sayfasındaki tüm alanları işletme bilgileriyle doldur.",
        adimlar: [
          "Admin → Ayarlar sayfasına git",
          "Restoran Adı, Telefon, E-posta, Adres doldur",
          "Çalışma saatlerini gir",
          "Kaydet butonuna tıkla",
        ],
      },
      {
        baslik: "Sistem özelliklerini işletmeye göre ayarla",
        sure: "3 dk",
        zorunlu: true,
        aciklama: "Her işletmenin çalışma modeli farklı. Hangi özelliklerin açık olacağına karar ver.",
        adimlar: [
          "QR ile Sipariş: garsonlu çalışıyorsa kapat",
          "Rezervasyon Modülü: walk-in mekan ise kapat",
          "KDS: mutfak ekranı istemiyorlarsa kapat",
          "Ödeme Yöntemleri: sadece kart alıyorlarsa nakit ve havaleyi kapat",
          "Stok Takibi: detaylı stok istemiyorlarsa otomatik düşmeyi kapat",
        ],
      },
    ],
  },
  {
    no: 5,
    baslik: "İçerik Girişi",
    ozet: "Menü, masa ve galeri verilerini gir. Bu en çok zaman alan kısım.",
    renk: "#EC4899",
    adimlar: [
      {
        baslik: "Masaları ekle",
        sure: "10 dk",
        zorunlu: true,
        aciklama: "Her masa için numara, kapasite ve alan tanımla. Masa numaraları QR kodlarla eşleşecek.",
        adimlar: [
          "Admin → Masa & QR sayfasına git",
          "İşletmedeki her masa için 'Yeni Masa Ekle' ile ekle",
          "Masa numarası, kapasite ve alan (Salon/Bahçe/Teras) gir",
          "Masa Planı'nda masaları sürükleyerek gerçek yerleşime göre düzenle",
        ],
      },
      {
        baslik: "Menüyü gir",
        sure: "30-60 dk",
        zorunlu: true,
        aciklama: "Kategori bazlı ürünleri ekle. Fiyatlar ₺ ile girilebilir.",
        adimlar: [
          "Admin → Menü Yönetimi sayfasına git",
          "Her ürün için: adı, açıklaması, fiyatı ve kategoriyi doldur",
          "İsteğe bağlı: fotoğraf URL'si ekle",
          "Stok takibi açıksa: her ürüne bağlı stok kalemi tanımla",
        ],
        notlar: [
          "Fotoğraf için Instagram post URL'leri kullanılabilir",
          "Menü girişini işletme sahibiyle birlikte yapman daha hızlı olur — ürün adlarını kendileri bilir",
        ],
      },
      {
        baslik: "QR kodları oluştur ve yazdır",
        sure: "15 dk",
        zorunlu: true,
        aciklama: "Her masa için QR kod oluştur, yazdır ve masalara yerleştir.",
        adimlar: [
          "Admin → Masa & QR sayfasına git",
          "Her masanın yanındaki QR ikonuna tıkla",
          "QR kodu PNG olarak indir",
          "Tüm masaları tek sayfada toplamak için tarayıcı yazdırma özelliğini kullan",
          "A4'e 4-6 QR sığar, laminasyon yaptırırsan daha uzun ömürlü olur",
        ],
        notlar: [
          "QR URL formatı: domain.com/masa/[masa-id]",
          "Masa numarası değişse bile URL değişmez — id sabittir",
        ],
      },
    ],
  },
  {
    no: 6,
    baslik: "E-posta Kurulumu (İsteğe Bağlı)",
    ozet: "Rezervasyon onay maili göndermek istiyorlarsa Resend entegrasyonu kur.",
    renk: "#64748B",
    adimlar: [
      {
        baslik: "Resend hesabı aç",
        sure: "10 dk",
        zorunlu: false,
        aciklama: "Resend ücretsiz planda aylık 3.000 e-posta gönderiyor. Küçük işletme için yeterli.",
        adimlar: [
          "resend.com'a git ve hesap oluştur",
          "Dashboard'dan 'API Keys' → 'Create API Key'",
          "İşletmenin domainini ekle ve DNS doğrulamasını yap",
          "API key'i kopyala",
          "Admin → Ayarlar → E-posta Ayarları'na yapıştır",
          "Gönderen e-posta: noreply@isletmedomain.com",
        ],
        link: { label: "resend.com", url: "https://resend.com" },
        notlar: [
          "Domain doğrulaması olmadan e-posta spam klasörüne düşebilir",
          "İşletmenin domain'i yoksa bu adımı şimdilik atla",
        ],
      },
    ],
  },
  {
    no: 7,
    baslik: "Fotoğraf Depolama (İsteğe Bağlı)",
    ozet: "Galeri için URL yerine gerçek fotoğraf yüklemesi isteniyorsa Cloudinary kur.",
    renk: "#0EA5E9",
    adimlar: [
      {
        baslik: "Cloudinary hesabı aç",
        sure: "10 dk",
        zorunlu: false,
        aciklama: "Her işletme için ayrı Cloudinary hesabı açılmalı. 25GB ücretsiz, bir restoran için yıllarca yeterli.",
        adimlar: [
          "cloudinary.com'a git ve ücretsiz hesap aç",
          "Dashboard'dan Cloud Name, API Key ve API Secret'ı kopyala",
          "Vercel → Settings → Environment Variables'a ekle:",
          "  CLOUDINARY_CLOUD_NAME",
          "  CLOUDINARY_API_KEY",
          "  CLOUDINARY_API_SECRET",
          "Vercel'de yeni deploy tetikle",
        ],
        link: { label: "cloudinary.com", url: "https://cloudinary.com" },
        notlar: [
          "Bu adım şimdilik atlanabilir — galeri URL bazlı çalışmaya devam eder",
          "İşletme fotoğraf yükleme isterse o zaman kur",
        ],
      },
    ],
  },
  {
    no: 8,
    baslik: "Web Push Bildirimleri (İsteğe Bağlı)",
    ozet: "Garsonlara ve müşterilere anlık bildirim göndermek için VAPID anahtarları oluştur.",
    renk: "#8B5CF6",
    adimlar: [
      {
        baslik: "VAPID anahtarları oluştur",
        sure: "5 dk",
        zorunlu: false,
        aciklama: "Web Push için gerekli anahtar çifti tek komutla oluşturulur. Her deployment için bir kez yapılır.",
        adimlar: [
          "Projede terminali aç",
          "Çalıştır: node -e \"require('web-push').generateVAPIDKeys().then(k => console.log(JSON.stringify(k)))\"",
          "Çıkan publicKey ve privateKey değerlerini kopyala",
          "Vercel → Settings → Environment Variables'a ekle:",
          "  VAPID_PUBLIC_KEY → publicKey değeri",
          "  VAPID_PRIVATE_KEY → privateKey değeri",
          "  VAPID_SUBJECT → mailto:admin@isletmedomain.com",
          "Yeni deploy tetikle",
        ],
        notlar: [
          "VAPID anahtarları bir kez oluşturulur — değiştirirsen mevcut abonelikler geçersiz olur",
          "iOS Safari 16.4+ ve tüm modern Android tarayıcılar destekler",
          "Garson uygulaması push için izin isteyecektir — garsonlara 'İzin Ver' demeleri gerektiğini söyle",
        ],
      },
    ],
  },
  {
    no: 9,
    baslik: "Online Ödeme (İsteğe Bağlı)",
    ozet: "Müşterilerin QR sayfasından kartla ödeme yapabilmesi için İyzico veya Stripe entegre et.",
    renk: "#EC4899",
    adimlar: [
      {
        baslik: "İyzico ile kurulum (Türkiye önerilir)",
        sure: "1-2 gün (başvuru onayı bekleme)",
        zorunlu: false,
        aciklama: "İyzico Türk işletmeler için en yaygın tercih. Sandbox ortamı anında kullanılabilir, production için başvuru gerekiyor.",
        adimlar: [
          "iyzico.com'a git → 'Hemen Başvur' ile işletme başvurusu yap",
          "Onay beklenirken sandbox ile test edebilirsin: sandbox.iyzipay.com",
          "Dashboard → Ayarlar → API Bilgileri'nden anahtarları al",
          "Vercel → Environment Variables'a ekle:",
          "  IYZICO_API_KEY → API anahtarı",
          "  IYZICO_SECRET_KEY → Gizli anahtar",
          "  IYZICO_ENV → sandbox (test için) veya prod (canlı için)",
          "  ODEME_PROVIDER → iyzico",
          "Admin → Ayarlar → Modüller'den 'Online Ödeme (QR)' switch'ini aç",
        ],
        link: { label: "iyzico.com", url: "https://iyzico.com" },
        notlar: [
          "İyzico komisyon oranı: işlem başına %2.49 + 0.25₺ (2026 itibarıyla — güncel oran için iyzico ile iletişime geç)",
          "Sandbox'ta test için kart numaraları: iyzico dokümantasyonunda mevcut",
          "Başvuruda şirket belgesi, vergi levhası ve banka hesabı gerekiyor",
        ],
      },
      {
        baslik: "Stripe ile kurulum (Uluslararası)",
        sure: "30 dk",
        zorunlu: false,
        aciklama: "Stripe daha hızlı kurulum sağlar ancak Türkiye'de kullanım için Stripe Atlas veya yabancı şirket gerekebilir.",
        adimlar: [
          "dashboard.stripe.com'a git ve hesap aç",
          "Developers → API Keys'den Test ve Live anahtarları al",
          "Vercel → Environment Variables'a ekle:",
          "  STRIPE_SECRET_KEY → sk_live_... (veya test için sk_test_...)",
          "  STRIPE_WEBHOOK_SECRET → Stripe Dashboard → Webhooks'tan al",
          "  ODEME_PROVIDER → stripe",
          "Stripe Dashboard → Webhooks → 'Add endpoint' ile ekle:",
          "  URL: https://siteurl.com/api/odeme/webhook?provider=stripe",
          "  Events: checkout.session.completed, charge.refunded",
        ],
        link: { label: "dashboard.stripe.com", url: "https://dashboard.stripe.com" },
        notlar: [
          "Stripe'ın webhook endpoint'ini test etmek için Stripe CLI kullanabilirsin",
          "İyzico tercih ediyorsan bu adımı atla",
        ],
      },
    ],
  },
  {
    no: 10,
    baslik: "Termal Yazıcı (İsteğe Bağlı)",
    ozet: "Kasa ve POS'tan ESC/POS protokolüyle termal yazıcıya fiş yazdır.",
    renk: "#0EA5E9",
    adimlar: [
      {
        baslik: "Yazıcıyı ağa bağla ve IP ayarla",
        sure: "15 dk",
        zorunlu: false,
        aciklama: "Epson TM serisi veya Star TSP serisi termal yazıcılar desteklenir. Yazıcı restoran ağında sabit IP ile çalışmalı.",
        adimlar: [
          "Yazıcıyı Wi-Fi veya Ethernet ile restoranın ağına bağla",
          "Yazıcının kendi menüsünden ağ ayarlarına gir",
          "DHCP yerine statik IP ata (örn. 192.168.1.100) — router'dan da rezerve edebilirsin",
          "Yazıcının IP adresini bir yere not et",
          "Admin → Ayarlar → Termal Yazıcı bölümüne gir",
          "IP adresini ve portu gir (varsayılan port: 9100)",
          "Kağıt genişliğini seç (58mm → 32 karakter, 80mm → 42 karakter)",
          "Kasa'dan fiş yazdır — yazıcıya gidecek, başarısız olursa browser print açılacak",
        ],
        notlar: [
          "Yazıcı ve POS aynı Wi-Fi ağında olmalı — farklı VLAN'da çalışmaz",
          "Türkçe karakter desteği code page 857 ile sağlanıyor (Epson/Star uyumlu)",
          "Yazıcı erişilemezse sistem otomatik browser print'e geçer — hiç fiş kesilmez diye hata vermez",
          "Epson TM-T20III ve Star TSP143 test edilmiş modellerdir",
        ],
      },
    ],
  },
  {
    no: 12,
    baslik: "İnternet ve Altyapı",
    ozet: "Sistem tamamen bulut tabanlı — internet kesilirse çalışmaz. Önlem olarak çift hat şart.",
    renk: "#EF4444",
    adimlar: [
      {
        baslik: "Çift internet hattı kur",
        sure: "1-2 gün (ISP kurulum süreci)",
        zorunlu: true,
        aciklama: "EatOs internet olmadan çalışmaz. Fiber kesildiğinde 4G devreye girmeli. Bu, offline geliştirmekten çok daha ucuz ve hızlı bir çözüm.",
        adimlar: [
          "Ana hat: fiber internet (Türk Telekom, Superonline vb.)",
          "Yedek hat: 4G/LTE mobil router (Vodafone, Turkcell, Türk Telekom)",
          "4G router'ı fiber modem'in WAN portuna bağla (failover modu)",
          "Fiber kesildiğinde router otomatik 4G'ye geçmeli — test et",
          "Alternatif: TP-Link Deco, Ubiquiti gibi router'larda failover ayarı var",
        ],
        notlar: [
          "Toplam maliyet: fiber ~200₺ + 4G SIM ~100-150₺ = aylık ~300-350₺",
          "Birçok 4G router failover özelliğini destekler — cihaz alırken sor",
          "Mobil SIM için kurumsal hat al — kota sınırı olmayan tarifeler var",
          "Elektrik kesintisine karşı modem + router'ı UPS'e bağla (~500₺ yatırım)",
        ],
      },
      {
        baslik: "Tablet ve cihaz hazırlığı",
        sure: "30 dk",
        zorunlu: false,
        aciklama: "Mutfak KDS ve garson terminalleri için sabit cihazlar önerilir.",
        adimlar: [
          "Mutfak KDS için: duvar montajlı Android tablet (2. el ~1.500₺)",
          "Tarayıcıyı tam ekran modunda aç: Chrome → Menü → 'Tam Ekran'",
          "Tablet şarjda sabit dursun — batarya ömrünü uzatmak için şarjı %80'de tut",
          "Garson için: cepteki tarayıcı yeterli, uygulama gerekmez",
          "PWA olarak ana ekrana ekle: Chrome → Paylaş → 'Ana Ekrana Ekle'",
        ],
        notlar: [
          "iOS Safari'de PWA kurulumu: Paylaş → 'Ana Ekrana Ekle'",
          "Kioskmode için Android'de 'Pinned Apps' özelliği kullanılabilir",
        ],
      },
    ],
  },
  {
    no: 13,
    baslik: "Canlıya Alma Testi",
    ozet: "Her şeyi kurduktan sonra gerçek bir sipariş akışını baştan sona test et.",
    renk: "#10B981",
    adimlar: [
      {
        baslik: "Uçtan uca test yap",
        sure: "20 dk",
        zorunlu: true,
        aciklama: "Müşteri deneyimini simüle et. Bir sorun varsa burada yakala.",
        adimlar: [
          "Telefonla bir masanın QR kodunu okut",
          "Menüden 2-3 ürün seç ve sipariş ver",
          "KDS açıksa mutfak ekranında siparişin göründüğünü doğrula",
          "Admin → Siparişler'den durumu 'Hazır' yap",
          "QR sayfasında 'Sipariş Hazır' bildiriminin çıktığını gör",
          "Admin → Kasa'dan masayı seç ve ödeme al",
          "Masanın 'Boş' durumuna döndüğünü kontrol et",
          "Rezervasyon modülü açıksa /rezervasyon sayfasından test rezervasyonu yap",
          "Admin → Raporlar'da bugünkü verinin göründüğünü doğrula",
          "Online ödeme açıksa: QR sayfasında 'Kartla Öde' butonuna bas, sandbox ödeme tamamla, Admin → Online Ödemeler'de kaydı gör",
          "Termal yazıcı varsa: Kasa'dan fiş yazdır, yazıcıdan çıktı al",
        ],
        notlar: [
          "Test siparişlerini sonradan silmek için doğrudan veritabanından DELETE yapabilirsin",
          "Neon dashboard'da SQL editör var — 'DELETE FROM Siparis WHERE id > 0' gibi",
        ],
      },
    ],
  },
];

export default function KurulumRehberi() {
  const [acik, setAcik] = useState<number[]>([]);
  const [tamamlandi, setTamamlandi] = useState<Set<number>>(new Set());
  const [checklistAcik, setChecklistAcik] = useState(true);

  const toggle = (no: number) =>
    setAcik((p) => p.includes(no) ? p.filter((n) => n !== no) : [...p, no]);

  const toggleTamamlandi = (i: number) =>
    setTamamlandi((p) => { const s = new Set(p); s.has(i) ? s.delete(i) : s.add(i); return s; });

  const zorunluSayisi = CHECKLIST.filter(c => c.zorunlu).length;
  const tamamlananZorunlu = CHECKLIST.filter((c, i) => c.zorunlu && tamamlandi.has(i)).length;

  return (
    <div className="max-w-3xl space-y-4">

      {/* Yeni Müşteri Checklist */}
      <div className="card overflow-hidden mb-2">
        <button
          onClick={() => setChecklistAcik(p => !p)}
          className="w-full flex items-center gap-4 p-5 text-left transition-colors hover:bg-white/5"
        >
          <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "#10B981" }}>
            ✓
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>Yeni Müşteri Checklist</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Anlaşma yapıldı, şimdi ne yapmalısın? — {tamamlananZorunlu}/{zorunluSayisi} zorunlu adım tamamlandı
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${(tamamlananZorunlu / zorunluSayisi) * 100}%`, backgroundColor: "#10B981" }} />
            </div>
            {checklistAcik
              ? <ChevronDown size={16} style={{ color: "var(--text-muted)" }} />
              : <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
            }
          </div>
        </button>

        {checklistAcik && (
          <div className="border-t px-5 pb-5 pt-4 space-y-2" style={{ borderColor: "var(--border)" }}>
            {CHECKLIST.map((item, i) => {
              const tamam = tamamlandi.has(i);
              return (
                <button
                  key={i}
                  onClick={() => toggleTamamlandi(i)}
                  className="w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors hover:bg-white/5"
                  style={{ opacity: tamam ? 0.5 : 1 }}
                >
                  {tamam
                    ? <CheckSquare size={16} style={{ color: "#10B981", flexShrink: 0, marginTop: 2 }} />
                    : <Square size={16} style={{ color: "var(--text-muted)", flexShrink: 0, marginTop: 2 }} />
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium" style={{ color: "var(--text)", textDecoration: tamam ? "line-through" : "none" }}>
                        {item.baslik}
                      </span>
                      {!item.zorunlu && (
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                          isteğe bağlı
                        </span>
                      )}
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>~{item.sure}</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{item.detay}</p>
                  </div>
                </button>
              );
            })}
            <button
              onClick={() => setTamamlandi(new Set())}
              className="mt-2 text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
            >
              Sıfırla (yeni müşteri için)
            </button>
          </div>
        )}
      </div>

      {/* Üst özet */}
      <div className="card p-5 mb-6" style={{ borderLeft: "3px solid #1A73E8" }}>
        <p className="text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Ne zaman kullanılır?</p>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Yeni bir işletme ile anlaşma yaptıktan sonra bu rehberi adım adım takip et.
          Zorunlu adımlar tamamlanınca sistem kullanıma hazır olur.
          İsteğe bağlı adımlar işletmenin ihtiyacına göre eklenir.
        </p>
        <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
            Zorunlu
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-500 inline-block" />
            İsteğe bağlı
          </span>
          <span>Zorunlu adımlar: ~2-3 saat · Tüm modüller: ~1 gün</span>
        </div>
      </div>

      {BOLUMLER.map((bolum) => {
        const isAcik = acik.includes(bolum.no);
        return (
          <div key={bolum.no} className="card overflow-hidden">
            {/* Bölüm başlığı */}
            <button
              onClick={() => toggle(bolum.no)}
              className="w-full flex items-center gap-4 p-5 text-left transition-colors hover:bg-white/5"
            >
              <span
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: bolum.renk }}
              >
                {bolum.no}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>{bolum.baslik}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>{bolum.ozet}</p>
              </div>
              {isAcik
                ? <ChevronDown size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                : <ChevronRight size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              }
            </button>

            {/* Adımlar */}
            {isAcik && (
              <div className="border-t px-5 pb-5 space-y-5" style={{ borderColor: "var(--border)" }}>
                {bolum.adimlar.map((adim, i) => (
                  <div key={i} className="pt-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: adim.zorunlu ? "#EF4444" : "#64748B" }}
                        />
                        <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>{adim.baslik}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!adim.zorunlu && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                            isteğe bağlı
                          </span>
                        )}
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>~{adim.sure}</span>
                      </div>
                    </div>

                    <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>{adim.aciklama}</p>

                    <ol className="space-y-1.5">
                      {adim.adimlar.map((s, j) => (
                        <li key={j} className="flex gap-2.5 text-sm">
                          {s.startsWith("  ") ? (
                            <span className="text-xs pl-5 font-mono py-0.5 rounded" style={{ color: "#60A5FA" }}>
                              {s.trim()}
                            </span>
                          ) : (
                            <>
                              <span className="flex-shrink-0 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold mt-0.5"
                                style={{ backgroundColor: "var(--bg)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                                {j + 1}
                              </span>
                              <span style={{ color: "var(--text)" }}>{s}</span>
                            </>
                          )}
                        </li>
                      ))}
                    </ol>

                    {adim.notlar && adim.notlar.length > 0 && (
                      <div className="mt-3 p-3 rounded-lg space-y-1" style={{ backgroundColor: "#F59E0B0D", border: "1px solid #F59E0B20" }}>
                        {adim.notlar.map((n, j) => (
                          <p key={j} className="text-xs" style={{ color: "#F59E0B" }}>
                            ⚠ {n}
                          </p>
                        ))}
                      </div>
                    )}

                    {adim.link && (
                      <a
                        href={adim.link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium transition-opacity hover:opacity-80"
                        style={{ color: "#1A73E8" }}
                      >
                        <ExternalLink size={11} />
                        {adim.link.label}
                      </a>
                    )}

                    {i < bolum.adimlar.length - 1 && (
                      <div className="mt-5 border-t" style={{ borderColor: "var(--border)" }} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
