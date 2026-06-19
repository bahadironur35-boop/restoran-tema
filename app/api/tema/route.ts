import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PUBLIC_KEYS = [
  "restaurantName", "phone", "email", "address",
  "weekdayHours", "weekendHours",
  "logoUrl", "logoPozisyon",
  "brandColor", "brandColorDark", "brandTextLight",
  "instagramHandle", "tripadvisorUrl", "googleMapsUrl",
  "rezervasyonSaatleri", "rezervasyonMaksKisi",
  "happyHourBaslangic", "happyHourBitis", "happyHourEtiket",
];

export async function GET() {
  const ayarlar = await prisma.ayar.findMany({
    where: { key: { in: PUBLIC_KEYS } },
  });
  const data = Object.fromEntries(ayarlar.map((a) => [a.key, a.value]));

  // Varsayılanlar
  const defaults: Record<string, string> = {
    restaurantName: "EatOs",
    brandColor:     "#C9A84C",
    brandColorDark: "#0F0F0F",
    brandTextLight: "#FFFFFF",
    logoPozisyon:   "orta",
  };

  return NextResponse.json({ ...defaults, ...data });
}
