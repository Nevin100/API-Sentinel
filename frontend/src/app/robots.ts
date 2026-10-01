import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/signup"],
      // app ke andar ke pages login ke peeche hain, crawler ka wahan kaam nahi
      disallow: ["/dashboard", "/endpoints", "/tester", "/collections", "/inspect", "/profile"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
