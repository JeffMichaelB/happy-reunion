"use client"

import { Check, Copy } from "@phosphor-icons/react"
import { useState } from "react"

import { Button } from "@/components/ui/button"

export function CopyLinkButton({
  link,
  label = "Copy link",
  variant = "outline",
  size = "sm",
  className,
}: {
  link: string
  label?: string
  variant?: "default" | "outline" | "secondary" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore clipboard failures (e.g. insecure context)
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={() => void copy()}
      aria-label={copied ? "Copied" : label}
    >
      {copied ? (
        <>
          <Check className="size-3.5" weight="bold" />
          Copied
        </>
      ) : (
        <>
          <Copy className="size-3.5" weight="bold" />
          {label}
        </>
      )}
    </Button>
  )
}
