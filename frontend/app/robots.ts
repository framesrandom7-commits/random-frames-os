import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://randomframes.os";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/portal/", "/login", "/dev/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
