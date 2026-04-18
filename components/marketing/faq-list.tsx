"use client"

import { useMemo, useState } from "react"

import { FaqItem } from "@/components/marketing/faq-item"
import { FAQ_CATEGORIES, type Faq, type FaqCategory } from "@/lib/marketing/faqs"
import { cn } from "@/lib/utils"

type Filter = "All" | FaqCategory

const FILTERS: readonly Filter[] = ["All", ...FAQ_CATEGORIES] as const

interface FaqListProps {
  faqs: readonly Faq[]
}

export function FaqList({ faqs }: FaqListProps) {
  const [active, setActive] = useState<Filter>("All")

  const visible = useMemo(
    () => (active === "All" ? faqs : faqs.filter((faq) => faq.category === active)),
    [active, faqs],
  )

  const counts = useMemo(() => {
    const map = new Map<Filter, number>()
    map.set("All", faqs.length)
    for (const cat of FAQ_CATEGORIES) {
      map.set(cat, faqs.filter((faq) => faq.category === cat).length)
    }
    return map
  }, [faqs])

  return (
    <div>
      <div
        role="tablist"
        aria-label="Filter FAQs by category"
        className="flex flex-wrap items-center gap-2"
      >
        {FILTERS.map((filter) => {
          const isActive = filter === active
          return (
            <button
              key={filter}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(filter)}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
                isActive
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground/80 hover:border-foreground/30 hover:text-foreground",
              )}
            >
              {filter}
              <span
                className={cn(
                  "font-mono text-[10px] tracking-wider",
                  isActive ? "text-background/70" : "text-muted-foreground",
                )}
              >
                {counts.get(filter)?.toString().padStart(2, "0")}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-10 border-t border-border">
        {visible.map((faq) => (
          <FaqItem
            key={faq.question}
            question={faq.question}
            answer={faq.answer}
          />
        ))}
        {visible.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No questions in this category yet.
          </p>
        ) : null}
      </div>
    </div>
  )
}
