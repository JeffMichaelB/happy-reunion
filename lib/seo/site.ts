export const siteConfig = {
  siteName: "The Reunion Projects",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3001",
  defaultDescription:
    "Conversations about the distance between who we were then and who we are now: the pivots, reinventions, and the beauty of the unexpected.",
  defaultOgImage: "/og.png",
  twitterHandle: "@reunionprojects",
} as const

export type SiteConfig = typeof siteConfig
