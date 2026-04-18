import type { MetadataRoute } from "next"

import { siteConfig } from "@/lib/seo/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/host/", "/auth/", "/login", "/schedule/", "/api/"],
      },
    ],
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
    host: siteConfig.siteUrl,
  }
}
