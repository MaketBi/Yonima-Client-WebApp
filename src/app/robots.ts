import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://www.poulzz.store";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/panier",
          "/commandes",
          "/commandes/*",
          "/profil",
          "/profil/*",
          "/login",
          "/register",
          "/offline",
          // Back-office vendeur : jamais indexé (les pages portent aussi noindex).
          "/vendeur",
          "/vendeur/*",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
