import Link from "next/link"
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr"

import { MARKETING_NAV_LINKS } from "@/lib/marketing/faqs"

export function MarketingFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 pt-20 md:pt-28">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <Link href="/" className="inline-block">
              <span className="font-heading text-xl font-bold tracking-tight text-foreground">
                The <span className="font-normal italic">Reunion</span> Projects
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-foreground/80">
              The stories that didn&rsquo;t make the feed.
              <br />
              <span className="text-muted-foreground">
                Conversations worth keeping.
              </span>
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Explore
            </p>
            <ul className="mt-5 space-y-3">
              {MARKETING_NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground/85 transition-colors hover:text-foreground"
                  >
                    {link.label}
                    <ArrowUpRight
                      className="size-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      weight="bold"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              For hosts
            </p>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-foreground/80">
              Ready to host your first Reunion? It takes a few minutes to set
              up.
            </p>
            <Link
              href="/login?mode=signup"
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-[rgba(255,255,255,0.2)_0px_0.5px_0px_0px_inset,rgba(0,0,0,0.2)_0px_0px_0px_0.5px_inset,rgba(0,0,0,0.05)_0px_1px_2px_0px] transition-all hover:opacity-85 active:translate-y-px"
            >
              Host a Reunion
              <ArrowUpRight className="size-4" weight="bold" />
            </Link>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="mt-20 select-none overflow-hidden py-6 md:mt-28 md:py-10"
      >
        <p className="whitespace-nowrap text-center font-heading text-[clamp(2.75rem,12vw,11rem)] font-bold leading-[0.95] tracking-[-0.04em] text-foreground/[0.09]">
          The <span className="font-normal italic">Reunion</span> Projects
        </p>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-6 py-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            &copy; {new Date().getFullYear()} The Reunion Projects
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {/* TODO: replace with real /privacy and /terms pages once written */}
            <Link
              href="#"
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="/login"
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Host Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
