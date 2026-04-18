import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Quotes } from "@phosphor-icons/react/dist/ssr"

import { CtaStrip } from "@/components/marketing/cta-strip"
import { FadeUp } from "@/components/marketing/motion"
import { buildMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = buildMetadata({
  title: "Manifesto",
  description:
    "Why The Reunion Projects exists, and how it redefines conversation in a world dominated by surface-level interactions.",
  path: "/manifesto",
})

export default function ManifestoPage() {
  return (
    <article>
      <header className="border-b border-border px-6 pt-24 pb-16 md:pt-32 md:pb-20">
        <div className="mx-auto max-w-5xl">
          <FadeUp>
            <div className="flex flex-col gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
              <span>Manifesto</span>
              <span className="hidden sm:inline">·</span>
              <span>Vol. 01</span>
              <span className="hidden sm:inline">·</span>
              <span>A Reunion Projects essay</span>
            </div>
          </FadeUp>

          <FadeUp delay={0.08}>
            <h1 className="mt-10 font-heading text-[clamp(2.75rem,7vw,5.75rem)] font-bold leading-[0.98] tracking-[-0.02em] text-foreground">
              Stop scrolling.
              <br />
              <span className="font-normal italic text-foreground/70">
                Start talking.
              </span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.16}>
            <p className="mt-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              An invitation back to real conversation &mdash; with the people
              who shaped the chapter you&rsquo;re in.
            </p>
          </FadeUp>
        </div>
      </header>

      <div className="px-6 py-20 md:py-32">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
          <aside className="md:col-span-3">
            <FadeUp>
              <div className="flex flex-col gap-6 md:sticky md:top-24">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Reading time
                  </p>
                  <p className="mt-2 font-mono text-sm text-foreground">
                    ~3 minutes
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Filed under
                  </p>
                  <p className="mt-2 font-mono text-sm text-foreground">
                    First principles
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Last revised
                  </p>
                  <p className="mt-2 font-mono text-sm text-foreground">
                    Spring 2026
                  </p>
                </div>
              </div>
            </FadeUp>
          </aside>

          <div className="md:col-span-9">
            <FadeUp>
              <p className="text-foreground/85 first-letter:float-left first-letter:mr-3 first-letter:font-heading first-letter:text-7xl first-letter:font-bold first-letter:leading-[0.85] first-letter:text-foreground md:first-letter:text-[6rem] text-lg leading-[1.7] md:text-xl md:leading-[1.7]">
                The Reunion Projects platform redefines conversation. Built on
                the insight that people love to share their stories &mdash; and
                that everyone has meaningful experiences they rarely get to
                talk about &mdash; it creates space for real, human connection.
                In a world dominated by surface-level interactions and endless
                posting, this is an invitation to stop scrolling and start
                talking.
              </p>
            </FadeUp>

            <FadeUp delay={0.1}>
              <figure className="my-16 border-l-2 border-foreground/30 pl-6 md:my-20 md:pl-10">
                <Quotes
                  className="size-7 text-foreground/40"
                  weight="fill"
                />
                <blockquote className="mt-5 font-heading text-2xl font-normal leading-[1.2] tracking-[-0.005em] text-foreground md:text-4xl md:leading-[1.15]">
                  Unlike traditional social platforms, it goes{" "}
                  <span className="italic">deeper</span>. It unlocks the
                  conversations we don&rsquo;t usually have time for.
                </blockquote>
              </figure>
            </FadeUp>

            <FadeUp delay={0.05}>
              <p className="text-base leading-[1.8] text-muted-foreground md:text-lg md:leading-[1.8]">
                It celebrates the experiences that shape who we are. By
                revisiting shared history and personal milestones, it fosters a
                level of bonding that&rsquo;s difficult to create in modern
                adulthood. The result is authentic dialogue, renewed
                relationships, and a sense of connection that feels both
                nostalgic and energizing.
              </p>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div className="mt-16 grid grid-cols-1 gap-6 border-t border-border pt-12 md:grid-cols-3">
                {[
                  {
                    label: "Authentic dialogue",
                    body: "Honest conversation with people who knew the version of you that came before.",
                  },
                  {
                    label: "Renewed relationships",
                    body: "Reach out without ceremony. Fifty minutes that often turn into something lasting.",
                  },
                  {
                    label: "Conversations worth keeping",
                    body: "Recordings, transcripts, and quiet artifacts you can return to in years.",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col gap-3">
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {item.label}
                    </span>
                    <p className="text-sm leading-relaxed text-foreground/80">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div className="mt-16 flex flex-col items-start gap-4 border-t border-border pt-12 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Curious how this looks in practice?
                </p>
                <Link
                  href="/ground-rules"
                  className="group inline-flex items-center gap-2 text-sm font-medium text-foreground transition-opacity hover:opacity-70"
                >
                  Read the Ground Rules
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    weight="bold"
                  />
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>

      <div className="px-6 pb-24 md:pb-32">
        <CtaStrip />
      </div>
    </article>
  )
}
