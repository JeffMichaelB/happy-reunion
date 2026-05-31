import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  CalendarBlank,
  ChatCircleText,
  Microphone,
  Quotes,
  ShareNetwork,
  Waveform,
} from "@phosphor-icons/react/dist/ssr"

import { CtaStrip } from "@/components/marketing/cta-strip"
import { FadeUp, Marquee, Stagger, StaggerItem } from "@/components/marketing/motion"
import { ReunionCardsStack } from "@/components/marketing/reunion-cards-stack"
import { buildMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = buildMetadata({
  title: "The stories that didn't make the feed",
  description:
    "Conversations about the distance between who we were then and who we are now: the pivots, reinventions, and the beauty of the unexpected.",
  path: "/",
})

const STEPS = [
  {
    label: "01",
    title: "Invite someone who shaped you",
    body: "Pick a person from a chapter that mattered. We hand you the prompts, the scheduling, and the warm-up — you bring the curiosity.",
  },
  {
    label: "02",
    title: "Sit down for a real conversation",
    body: "Fifty minutes, two voices, no algorithm in the room. Record in-person or remote. The guest sets what is on or off limits.",
  },
  {
    label: "03",
    title: "Keep it. Share it. Pass it on.",
    body: "Your Reunion is yours: a private artifact for the two of you, a quiet share with family, or — only with consent — a public story.",
  },
] as const

const ARTIFACTS = [
  {
    icon: CalendarBlank,
    label: "Schedule",
    title: "A calendar that respects everyone's pace",
    body: "Send invitations, propose times, and capture context — all without leaving the platform.",
    span: "md:col-span-3",
  },
  {
    icon: Microphone,
    label: "Record",
    title: "Studio-quality capture, zero setup",
    body: "Multi-track audio, secure storage, and instant transcripts the moment you wrap.",
    span: "md:col-span-3",
  },
  {
    icon: ChatCircleText,
    label: "Prompts",
    title: "Conversation guides crafted for depth",
    body: "Curated prompts and reflection cards keep the conversation honest and human.",
    span: "md:col-span-2",
  },
  {
    icon: Waveform,
    label: "Edit",
    title: "Light-touch editing, no production team needed",
    body: "Trim silences, mark highlights, and keep the original cut untouched.",
    span: "md:col-span-2",
  },
  {
    icon: ShareNetwork,
    label: "Share",
    title: "Mutual consent before anything leaves the room",
    body: "Private by default. Shareable with a link, a family circle, or a wider audience — only when both sides agree.",
    span: "md:col-span-2",
  },
] as const

const VALUES = [
  "Real voices",
  "Honest stories",
  "No feed",
  "No filters",
  "Just presence",
  "Conversations worth keeping",
] as const

export default function HomePage() {
  return (
    <>
      <section
        aria-labelledby="hero-heading"
        className="relative lg:flex lg:min-h-[calc(100svh-4rem)] lg:flex-col"
      >
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-16 px-6 pb-12 pt-12 lg:flex-1 lg:grid-cols-12 lg:items-center lg:gap-12 lg:py-12">
          <div className="lg:col-span-7">
            <FadeUp>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <span className="mr-3 inline-block h-1 w-6 -translate-y-1 bg-foreground/40 align-middle" />
                Reunion Projects · Vol. 01
              </p>
            </FadeUp>

            <FadeUp delay={0.08}>
              <h1
                id="hero-heading"
                className="mt-8 font-heading text-[clamp(2.75rem,6.4vw,5.5rem)] font-bold leading-[0.98] tracking-[-0.02em] text-foreground"
              >
                The stories that
                <br className="hidden sm:block" />{" "}
                didn&rsquo;t make the{" "}
                <span className="font-heading italic font-normal">feed</span>.
              </h1>
            </FadeUp>

            <FadeUp delay={0.16}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                Conversations about the distance between who we were then and
                who we are now &mdash; the pivots, the reinventions, the beauty
                of the unexpected.
              </p>
            </FadeUp>

            <FadeUp delay={0.24}>
              <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/signup"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-[rgba(255,255,255,0.2)_0px_0.5px_0px_0px_inset,rgba(0,0,0,0.2)_0px_0px_0px_0.5px_inset,rgba(0,0,0,0.05)_0px_1px_2px_0px] transition-all hover:opacity-85 active:translate-y-px"
                >
                  Host a Reunion
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    weight="bold"
                  />
                </Link>
                <Link
                  href="/manifesto"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-[rgba(28,28,28,0.04)]"
                >
                  Read the manifesto
                  <ArrowUpRight
                    className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    weight="bold"
                  />
                </Link>
              </div>
            </FadeUp>
          </div>

          <div className="hidden lg:col-span-5 lg:block lg:-translate-y-6">
            <ReunionCardsStack />
          </div>
        </div>
      </section>

      <section
        aria-label="Premise"
        className="border-t border-border px-6 pt-16 pb-28 md:pt-20 md:pb-40"
      >
        <FadeUp className="mx-auto max-w-5xl">
          <Quotes
            className="size-10 text-foreground/30 md:size-12"
            weight="fill"
          />
          <p className="mt-8 font-heading text-[clamp(2rem,4.4vw,3.75rem)] font-normal leading-[1.1] tracking-[-0.01em] text-foreground">
            Do you want to talk about the weather? Or do you want to talk about
            how you&rsquo;re really doing and who you really are?
          </p>
          <div className="mt-10 flex items-center gap-4">
            <span className="block h-px w-12 bg-foreground/30" />
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              The premise
            </span>
          </div>
        </FadeUp>
      </section>

      <section
        aria-labelledby="how-heading"
        className="border-t border-border px-6 py-24 md:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-4">
              <FadeUp>
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  How it works
                </p>
                <h2
                  id="how-heading"
                  className="mt-6 font-heading text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-5xl"
                >
                  Three simple steps
                </h2>
                <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
                  We handle invitations, scheduling, recording, transcripts,
                  and storage. You handle the part only you can do: showing up.
                </p>
              </FadeUp>
            </div>

            <Stagger
              as="ol"
              className="md:col-span-8 md:grid md:grid-cols-3 md:gap-6"
            >
              {STEPS.map((step) => (
                <StaggerItem
                  key={step.label}
                  as="li"
                  className="flex flex-col gap-4 border-t border-border pt-6 md:border-t-0 md:border-l md:pl-6 md:pt-0"
                >
                  <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Step {step.label}
                  </span>
                  <h3 className="font-heading text-2xl font-semibold leading-tight tracking-tight text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                    {step.body}
                  </p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="artifacts-heading"
        className="border-t border-border px-6 py-24 md:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <FadeUp className="max-w-3xl">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              The toolkit
            </p>
            <h2
              id="artifacts-heading"
              className="mt-6 font-heading text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-5xl"
            >
              Everything a Reunion needs.
              <br />
              <span className="italic font-normal text-foreground/60">
                Nothing it doesn&rsquo;t.
              </span>
            </h2>
          </FadeUp>

          <Stagger className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-6 md:gap-5">
            {ARTIFACTS.map((tile) => {
              const Icon = tile.icon
              return (
                <StaggerItem
                  key={tile.title}
                  className={`group flex flex-col rounded-2xl border border-border bg-popover p-6 transition-colors hover:border-foreground/20 md:p-8 ${tile.span}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-md border border-border bg-background">
                      <Icon className="size-4 text-foreground" weight="bold" />
                    </div>
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      {tile.label}
                    </span>
                  </div>
                  <h3 className="mt-8 font-heading text-xl font-semibold leading-tight tracking-tight text-foreground md:text-2xl">
                    {tile.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {tile.body}
                  </p>
                </StaggerItem>
              )
            })}
          </Stagger>
        </div>
      </section>

      <section
        aria-labelledby="manifesto-teaser-heading"
        className="border-t border-border bg-foreground text-background"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-24 md:grid-cols-12 md:py-32">
          <div className="md:col-span-7">
            <FadeUp>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-background/50">
                Manifesto · 02
              </p>
              <h2
                id="manifesto-teaser-heading"
                className="mt-6 font-heading text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl"
              >
                Stop scrolling.
                <br />
                <span className="italic font-normal text-background/70">
                  Start talking.
                </span>
              </h2>
            </FadeUp>
          </div>

          <div className="md:col-span-5">
            <FadeUp delay={0.1}>
              <p className="text-base leading-relaxed text-background/75 md:text-lg">
                In a world dominated by surface-level interactions, this is an
                invitation to go deeper. To revisit shared history. To
                celebrate the experiences that shape who we are. To leave with
                a record of conversations worth keeping.
              </p>
              <Link
                href="/manifesto"
                className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-background transition-opacity hover:opacity-80"
              >
                Read the full manifesto
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  weight="bold"
                />
              </Link>
            </FadeUp>
          </div>
        </div>
      </section>

      <section
        aria-label="Values"
        className="border-t border-border py-12 md:py-16"
      >
        <Marquee speedSeconds={45}>
          {VALUES.map((value) => (
            <span
              key={value}
              className="flex shrink-0 items-center gap-12 font-heading text-3xl font-normal italic leading-none text-foreground/80 md:text-4xl"
            >
              {value}
              <span
                aria-hidden="true"
                className="font-sans text-3xl not-italic text-foreground/30 md:text-4xl"
              >
                ·
              </span>
            </span>
          ))}
        </Marquee>
      </section>

      <div className="px-6 pb-24 md:pb-32">
        <CtaStrip
          heading="Your first Reunion is closer than you think."
          subheading="A few minutes to set up. A conversation that lasts."
        />
      </div>
    </>
  )
}
