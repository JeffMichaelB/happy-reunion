"use client"

import { ShareNetwork } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"

export function ShareLinkButton({ url }: { url: string }) {
  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Book a reunion with me", url })
        return
      } catch {
        // user dismissed the share sheet; fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // ignore clipboard failures (e.g. insecure context)
    }
  }

  return (
    <Button type="button" variant="outline" onClick={() => void share()}>
      <ShareNetwork className="size-3.5" weight="bold" />
      Share
    </Button>
  )
}
