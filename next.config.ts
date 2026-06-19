import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // iyzipay uses dynamic require() which is incompatible with Turbopack bundler
  serverExternalPackages: ["iyzipay"],
};

export default nextConfig;
