import type { MetadataRoute } from "next"

import { siteConfig } from "@/lib/seo/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  const routes = [
    { path: "/", priority: 1.0, changeFrequency: "monthly" as const },
    { path: "/manifesto", priority: 0.8, changeFrequency: "yearly" as const },
    { path: "/ground-rules", priority: 0.8, changeFrequency: "yearly" as const },
    { path: "/faqs", priority: 0.8, changeFrequency: "monthly" as const },
  ]

  return routes.map((route) => ({
    url: `${siteConfig.siteUrl}${route.path === "/" ? "" : route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
