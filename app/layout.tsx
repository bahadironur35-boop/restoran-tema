import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://restoran-tema.vercel.app";
const SITE_NAME = "EatOs";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Fine Dining Restaurant İstanbul`,
    template: `%s | ${SITE_NAME}`,
  },
  description: "İstanbul'un kalbinde eşsiz lezzetler ve zarif atmosfer. Michelin yıldızlı şef kadrosu, özenle seçilmiş şarap listesi. Online rezervasyon yapın.",
  keywords: ["restoran istanbul", "fine dining istanbul", "rezervasyon", "türk mutfağı", "lüks restoran"],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Fine Dining Restaurant İstanbul`,
    description: "İstanbul'un kalbinde eşsiz lezzetler ve zarif atmosfer. Online rezervasyon yapın.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} Restaurant`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Fine Dining Restaurant İstanbul`,
    description: "İstanbul'un kalbinde eşsiz lezzetler ve zarif atmosfer.",
    images: ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
