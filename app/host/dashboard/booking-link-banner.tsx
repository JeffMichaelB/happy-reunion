import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"

import { CopyLinkButton } from "./copy-link-button"

const darkButtonShadow =
  "shadow-[rgba(255,255,255,0.2)_0px_0.5px_0px_0px_inset,rgba(0,0,0,0.2)_0px_0px_0px_0.5px_inset,rgba(0,0,0,0.05)_0px_1px_2px_0px]"

export function BookingLinkBanner({
  url,
  hostName,
}: {
  url: string | null
  hostName: string | null
}) {
  if (!url) {
    return (
      <div className="rounded-xl border border-dashed border-[rgba(28,28,28,0.4)] bg-[#f3f0e8] p-4 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:p-5">
        <p className="text-sm text-[#1c1c1c]">
          Connect Cal.com to get a shareable booking link
          {hostName ? ` for ${hostName}` : ""}.
        </p>
        <Link
          href="/host/settings"
          className={`mt-3 inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-[#1c1c1c] px-3 text-sm font-medium text-[#fcfbf8] transition-opacity hover:opacity-85 sm:mt-0 ${darkButtonShadow}`}
        >
          Set up Cal.com
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[#1c1c1c] bg-[#1c1c1c] p-4 text-[#fcfbf8] sm:p-5">
      <p className="text-sm font-medium">
        {hostName ? `${hostName}'s booking link` : "Your booking link"}
      </p>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="min-w-0 flex-1 truncate font-mono text-[13px] text-[#fcfbf8]/75">
          {url}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <CopyLinkButton
            link={url}
            label="Copy"
            className={`border-transparent bg-[#fcfbf8] text-[#1c1c1c] hover:opacity-85 ${darkButtonShadow}`}
          />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1 rounded-md px-3 text-sm font-medium text-[#fcfbf8]/90 transition-colors hover:bg-[rgba(252,251,248,0.1)]"
          >
            <ArrowSquareOut className="size-3.5" weight="bold" />
            Open
          </a>
        </div>
      </div>
    </div>
  )
}
