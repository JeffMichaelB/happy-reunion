import { ImageResponse } from "next/og"

import { siteConfig } from "@/lib/seo/site"

export const alt = `${siteConfig.siteName}: ${siteConfig.defaultTitle}`
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "#f7f4ed",
          color: "#1c1c1c",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: 72,
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              alignItems: "baseline",
              display: "flex",
              fontSize: 28,
              fontWeight: 700,
              gap: 6,
              letterSpacing: "-0.02em",
            }}
          >
            <span>The</span>
            <span style={{ fontStyle: "italic", fontWeight: 400 }}>Reunion</span>
            <span>Projects</span>
          </div>
          <div
            style={{
              border: "1px solid rgba(28, 28, 28, 0.18)",
              borderRadius: 999,
              fontSize: 18,
              padding: "10px 18px",
            }}
          >
            Conversations worth keeping
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Reunion Projects · Vol. 01
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 88,
              fontWeight: 800,
              letterSpacing: "-0.055em",
              lineHeight: 0.98,
              maxWidth: 900,
            }}
          >
            The stories that didn&apos;t make the feed.
          </div>
          <div
            style={{
              color: "#5f5f5d",
              display: "flex",
              fontSize: 30,
              lineHeight: 1.35,
              maxWidth: 850,
            }}
          >
            Guided conversations for preserving the pivots, reinventions, and
            unexpected beauty in real lives.
          </div>
        </div>

        <div
          style={{
            alignItems: "center",
            borderTop: "1px solid #eceae4",
            display: "flex",
            fontSize: 22,
            justifyContent: "space-between",
            paddingTop: 28,
            width: "100%",
          }}
        >
          <span>Schedule · Record · Remember</span>
          <span>thereunionprojects.com</span>
        </div>
      </div>
    ),
    size,
  )
}
