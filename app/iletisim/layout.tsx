import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İletişim",
  description: "EatOs ile iletişime geçin. Adres, telefon ve mesaj formuyla bize ulaşın. Bağdat Caddesi, Kadıköy, İstanbul.",
  openGraph: {
    title: "İletişim | EatOs",
    description: "Bize ulaşın.",
  },
};

export default function IletisimLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
