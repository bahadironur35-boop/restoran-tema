import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rezervasyon",
  description: "EatOs'da masanızı online olarak ayırtın. 24 saat içinde onay alın. Özel gün rezervasyonları için notunuzu ekleyin.",
  openGraph: {
    title: "Rezervasyon | EatOs",
    description: "Masanızı online olarak ayırtın.",
    images: ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80"],
  },
};

export default function RezervaseyonLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
