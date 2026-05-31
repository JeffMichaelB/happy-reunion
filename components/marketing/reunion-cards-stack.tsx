"use client"

import { motion } from "motion/react"
import { Microphone, Waveform } from "@phosphor-icons/react"

const CARDS = [
  {
    eyebrow: "REUNION 014",
    name: "Marisol & The Class of '08",
    detail: "Recorded · 58 min",
    initials: "MR",
    rotation: -6,
    translateX: -16,
    translateY: 8,
    z: 1,
  },
  {
    eyebrow: "REUNION 022",
    name: "Daniel · Founding team",
    detail: "Scheduled · Friday, 5pm",
    initials: "DK",
    rotation: 4,
    translateX: 12,
    translateY: 0,
    z: 3,
  },
  {
    eyebrow: "REUNION 031",
    name: "Aiyana · Camp Pinecrest",
    detail: "Draft · 3 prompts ready",
    initials: "AY",
    rotation: -2,
    translateX: 36,
    translateY: -28,
    z: 2,
  },
] as const

export function ReunionCardsStack() {
  return (
    <div className="relative mx-auto h-[380px] w-full max-w-[440px]">
      {CARDS.map((card, idx) => (
        <motion.div
          key={card.name}
          initial={{ opacity: 0, y: 40, rotate: card.rotation - 4 }}
          animate={{
            opacity: 1,
            y: card.translateY,
            x: card.translateX,
            rotate: card.rotation,
          }}
          transition={{
            duration: 0.9,
            delay: 0.2 + idx * 0.12,
            ease: [0.22, 1, 0.36, 1],
          }}
          whileHover={{
            rotate: 0,
            y: card.translateY - 6,
            transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
          }}
          style={{ zIndex: card.z }}
          className="absolute left-1/2 top-1/2 w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-popover p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.6)_inset,0_30px_60px_-30px_rgba(28,28,28,0.18),0_0_0_0.5px_rgba(28,28,28,0.05)]"
        >
          <div className="flex items-start justify-between">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {card.eyebrow}
            </p>
            <div className="flex size-8 items-center justify-center rounded-full border border-border bg-background text-[11px] font-medium text-foreground/80">
              {card.initials}
            </div>
          </div>

          <p className="mt-6 font-heading text-xl font-semibold leading-tight tracking-tight text-foreground">
            {card.name}
          </p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {card.detail}
          </p>

          <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
            <div className="flex size-9 items-center justify-center rounded-full bg-foreground text-background">
              {idx === 1 ? (
                <Microphone className="size-4" weight="fill" />
              ) : (
                <Waveform className="size-4" weight="fill" />
              )}
            </div>
            <div className="flex flex-1 items-end gap-[3px]">
              {[6, 14, 22, 12, 28, 18, 30, 14, 22, 10, 18, 26, 12, 8].map(
                (h, i) => (
                  <span
                    key={i}
                    className="block w-[3px] rounded-full bg-foreground/15"
                    style={{ height: `${h}px` }}
                  />
                ),
              )}
            </div>
          </div>
        </motion.div>
      ))}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-12 mx-auto h-24 w-[280px] rounded-[100%] bg-foreground/5 blur-2xl"
      />
    </div>
  )
}
