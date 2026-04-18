"use client"

import { useState } from "react"
import { CaretDown } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

interface FaqItemProps {
  question: string
  answer: string
}

export function FaqItem({ question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-foreground/80"
        aria-expanded={open}
      >
        <span className="pr-4 text-base font-medium md:text-lg">
          {question}
        </span>
        <CaretDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
          weight="bold"
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200",
          open ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-muted-foreground md:text-base md:leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  )
}
