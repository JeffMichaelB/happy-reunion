"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

export function CopyScheduleLinkButton({ url }: { url: string }) {
  const [label, setLabel] = useState("Copy link")

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setLabel("Copied")
      setTimeout(() => setLabel("Copy link"), 2000)
    } catch {
      setLabel("Copy failed")
      setTimeout(() => setLabel("Copy link"), 2000)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={!url}
      onClick={() => void copy()}
    >
      {label}
    </Button>
  )
}
