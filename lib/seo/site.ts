export const siteConfig = {
  siteName: "The Reunion Projects",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3001",
  defaultTitle: "The stories that didn't make the feed",
  defaultDescription:
    "Conversations about the distance between who we were then and who we are now: the pivots, reinventions, and the beauty of the unexpected.",
  defaultOgImage: "/opengraph-image",
  twitterHandle: "@reunionprojects",
  keywords: [
    "reunion conversations",
    "oral history",
    "story recording",
    "conversation prompts",
    "family stories",
    "podcast interviews",
  ],
} as const

export type SiteConfig = typeof siteConfig
