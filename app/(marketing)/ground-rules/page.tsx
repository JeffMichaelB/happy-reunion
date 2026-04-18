import type { Metadata } from "next"

import { CtaStrip } from "@/components/marketing/cta-strip"
import { FadeUp, Stagger, StaggerItem } from "@/components/marketing/motion"
import { buildMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = buildMetadata({
  title: "Ground Rules",
  description:
    "How we keep Reunions safe, honest, and worth remembering. The principles that guide every conversation.",
  path: "/ground-rules",
})

const GROUND_RULES = [
  {
    rule: "This is not about revisiting old dynamics or antics.",
    detail:
      "Reunions are about who you are now, not who you were forced to be then. Old roles stay at the door.",
  },
  {
    rule: "No bullying, roasting, or \u201Cgotcha\u201D moments \u2014 ever.",
    detail:
      "There is no place for performance at someone else\u2019s expense. If a moment feels like it might land that way, don\u2019t go there.",
  },
  {
    rule: "The guest decides what is on- or off-limits \u2014 always.",
    detail:
      "Their comfort sets the boundaries. As host, you ask, you check in, and you change course when they need you to.",
  },
  {
    rule: "Politics, old relationships, and past escapades are off the table.",
    detail:
      "Unless the guest specifically wants to go there. The default is generosity, not gossip.",
  },
  {
    rule: "No need to be funny. Just be you.",
    detail:
      "We don\u2019t grade for charisma. Honesty is more interesting than performance every single time.",
  },
] as const

export default function GroundRulesPage() {
  return (
    <article>
      <header className="border-b border-border px-6 pt-24 pb-16 md:pt-32 md:pb-20">
        <div className="mx-auto max-w-5xl">
          <FadeUp>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Ground Rules
            </p>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h1 className="mt-8 font-heading text-[clamp(2.75rem,7vw,5.75rem)] font-bold leading-[0.98] tracking-[-0.02em] text-foreground">
              The contract,
              <br />
              <span className="font-normal italic text-foreground/70">
                in five lines.
              </span>
            </h1>
          </FadeUp>
          <FadeUp delay={0.16}>
            <p className="mt-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Reunions are a space for honest, respectful conversation. These
              are the principles every host agrees to before the first
              invitation goes out.
            </p>
          </FadeUp>
        </div>
      </header>

      <div className="px-6 py-20 md:py-28">
        <Stagger
          as="ol"
          className="mx-auto max-w-5xl divide-y divide-border border-y border-border"
        >
          {GROUND_RULES.map((item, idx) => (
            <StaggerItem
              key={item.rule}
              as="li"
              className="grid grid-cols-1 gap-4 py-10 md:grid-cols-12 md:gap-10 md:py-14"
            >
              <div className="md:col-span-2">
                <span className="font-mono text-sm text-muted-foreground">
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="md:col-span-7">
                <p className="font-heading text-2xl font-semibold leading-[1.2] tracking-tight text-foreground md:text-3xl">
                  {item.rule}
                </p>
              </div>

              <div className="md:col-span-3">
                <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                  {item.detail}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <FadeUp className="mx-auto mt-20 max-w-3xl text-center md:mt-24">
          <p className="font-heading text-2xl font-normal italic leading-tight text-foreground/80 md:text-3xl">
            &ldquo;Reunions work because everyone shows up assuming the best of
            everyone else.&rdquo;
          </p>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            The shared agreement
          </p>
        </FadeUp>
      </div>

      <div className="px-6 pb-24 md:pb-32">
        <CtaStrip
          heading="Sound like your kind of conversation?"
          subheading="Hosting takes a few minutes. The conversation lasts a lifetime."
        />
      </div>
    </article>
  )
}
