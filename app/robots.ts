import type { MetadataRoute } from "next";

const SITE_URL = "https://restoran-tema.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/mutfak/", "/masa/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
