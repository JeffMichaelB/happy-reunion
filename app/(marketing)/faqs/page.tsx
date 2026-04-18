import type { Metadata } from "next"

import { CtaStrip } from "@/components/marketing/cta-strip"
import { FaqList } from "@/components/marketing/faq-list"
import { FadeUp } from "@/components/marketing/motion"
import { FAQS } from "@/lib/marketing/faqs"
import { buildMetadata } from "@/lib/seo/metadata"

export const metadata: Metadata = buildMetadata({
  title: "Frequently Asked Questions",
  description:
    "Hosting, guesting, and making the most of your Reunion. Everything you need to know.",
  path: "/faqs",
})

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
}

export default function FaqsPage() {
  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <header className="border-b border-border px-6 pt-24 pb-16 md:pt-32 md:pb-20">
        <div className="mx-auto max-w-5xl">
          <FadeUp>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Frequently Asked Questions
            </p>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h1 className="mt-8 font-heading text-[clamp(2.75rem,7vw,5.75rem)] font-bold leading-[0.98] tracking-[-0.02em] text-foreground">
              Everything you might
              <br />
              <span className="font-normal italic text-foreground/70">
                want to ask first.
              </span>
            </h1>
          </FadeUp>
          <FadeUp delay={0.16}>
            <p className="mt-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              The hosting flow, the guest experience, the privacy promises.
              Filter by what you&rsquo;re here to figure out.
            </p>
          </FadeUp>
        </div>
      </header>

      <div className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <FadeUp>
            <FaqList faqs={FAQS} />
          </FadeUp>
        </div>
      </div>

      <div className="px-6 pb-24 md:pb-32">
        <CtaStrip
          heading="Still curious?"
          subheading="The best way to understand a Reunion is to host one."
        />
      </div>
    </article>
  )
}
