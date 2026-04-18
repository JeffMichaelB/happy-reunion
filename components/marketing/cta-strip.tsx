import Link from "next/link"
import { ArrowRight } from "@phosphor-icons/react/dist/ssr"

interface CtaStripProps {
  heading?: string
  subheading?: string
  ctaLabel?: string
  ctaHref?: string
}

export function CtaStrip({
  heading = "Ready to start your first Reunion?",
  subheading = "Hosting takes a few minutes to set up. The conversation lasts a lifetime.",
  ctaLabel = "Host a Reunion",
  ctaHref = "/login?mode=signup",
}: CtaStripProps) {
  return (
    <section className="mx-auto mt-32 max-w-3xl md:mt-40">
      <div className="rounded-2xl border border-border bg-background p-10 text-center md:p-14">
        <h2 className="font-heading text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl">
          {heading}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
          {subheading}
        </p>
        <div className="mt-8">
          <Link
            href={ctaHref}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-[rgba(255,255,255,0.2)_0px_0.5px_0px_0px_inset,rgba(0,0,0,0.2)_0px_0px_0px_0.5px_inset,rgba(0,0,0,0.05)_0px_1px_2px_0px] transition-all hover:opacity-85 active:translate-y-px"
          >
            {ctaLabel}
            <ArrowRight className="size-4" weight="bold" />
          </Link>
        </div>
      </div>
    </section>
  )
}
