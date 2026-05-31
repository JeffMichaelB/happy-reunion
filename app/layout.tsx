import type { Metadata } from "next"
import { Geist_Mono, Outfit, Merriweather } from "next/font/google"

import { AuthSessionHandler } from "@/components/auth-session-handler"
import "./globals.css"
import { cn } from "@/lib/utils"
import { siteConfig } from "@/lib/seo/site"

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.siteName,
    template: `%s · ${siteConfig.siteName}`,
  },
  description: siteConfig.defaultDescription,
  applicationName: siteConfig.siteName,
  openGraph: {
    siteName: siteConfig.siteName,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    creator: siteConfig.twitterHandle,
  },
}

const merriweatherHeading = Merriweather({
  subsets: ["latin"],
  variable: "--font-heading",
})

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        outfit.variable,
        merriweatherHeading.variable,
      )}
    >
      <body>
        <AuthSessionHandler />
        {children}
      </body>
    </html>
  )
}
