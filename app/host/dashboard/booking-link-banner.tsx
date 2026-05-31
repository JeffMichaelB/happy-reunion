import { ArrowSquareOut, CalendarBlank } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"

import { Card } from "@/components/ui/card"

import { CopyLinkButton } from "./copy-link-button"

export function BookingLinkBanner({
  url,
  hostName,
}: {
  url: string | null
  hostName: string | null
}) {
  if (!url) {
    return (
      <Card className="rounded-xl border-dashed bg-muted/30">
        <div className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background">
              <CalendarBlank className="size-5 text-muted-foreground" weight="regular" />
            </div>
            <div>
              <p className="text-sm font-medium">No booking link yet</p>
              <p className="text-sm text-muted-foreground">
                Connect Cal.com and pick an event type to get a shareable link
                for your guests.
              </p>
            </div>
          </div>
          <Link
            href="/host/settings"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Set up Cal.com
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden rounded-xl">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-foreground/[0.04]">
            <CalendarBlank className="size-5" weight="regular" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Your booking link
            </p>
            <p className="mt-1 text-sm font-medium">
              {hostName
                ? `Share with guests to book time with ${hostName}.`
                : "Share with guests to book time with you."}
            </p>
            <p className="mt-1 truncate font-mono text-[13px] text-muted-foreground">
              {url}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <CopyLinkButton link={url} />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1 rounded-md border border-[rgba(28,28,28,0.4)] bg-transparent px-3 text-sm font-medium transition-colors hover:bg-[rgba(28,28,28,0.04)]"
          >
            <ArrowSquareOut className="size-3.5" weight="bold" />
            Open
          </a>
        </div>
      </div>
    </Card>
  )
}
