import type { Metadata } from "next"

import { siteConfig } from "./site"

interface BuildMetadataInput {
  title: string
  description?: string
  path: string
  ogImage?: string
}

export function buildMetadata({
  title,
  description = siteConfig.defaultDescription,
  path,
  ogImage = siteConfig.defaultOgImage,
}: BuildMetadataInput): Metadata {
  const normalizedPath = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`
  const url = `${siteConfig.siteUrl}${normalizedPath}`
  const imageUrl = ogImage.startsWith("http")
    ? ogImage
    : `${siteConfig.siteUrl}${ogImage}`

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.siteName,
      type: "website",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
      creator: siteConfig.twitterHandle,
    },
  }
}
