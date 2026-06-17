import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "La Maison — Fine Dining Restaurant",
  description: "Eşsiz lezzetler ve zarif atmosfer ile unutulmaz bir yemek deneyimi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full">
      <body className="min-h-full flex flex-col bg-[#0F0F0F] text-white">
        {children}
      </body>
    </html>
  );
}
