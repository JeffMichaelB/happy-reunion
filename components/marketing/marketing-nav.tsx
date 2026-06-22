"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowUpRight, List, X } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { MARKETING_NAV_LINKS } from "@/lib/marketing/faqs"

const PRIMARY_BUTTON_CLASS =
  "inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground shadow-[rgba(255,255,255,0.2)_0px_0.5px_0px_0px_inset,rgba(0,0,0,0.2)_0px_0px_0px_0.5px_inset,rgba(0,0,0,0.05)_0px_1px_2px_0px] transition-all hover:opacity-85 active:translate-y-px"

function Wordmark() {
  return (
    <span className="font-heading text-lg font-bold tracking-tight text-foreground">
      The <span className="font-normal italic">Reunion</span> Projects
    </span>
  )
}

export function MarketingNav() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = original
    }
  }, [mobileMenuOpen])

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 shrink-0 transition-[background-color,border-color,backdrop-filter] duration-300",
          scrolled || mobileMenuOpen
            ? "border-b border-border/70 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/65"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5"
            aria-label="The Reunion Projects home"
          >
            <span
              aria-hidden="true"
              className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors group-hover:text-foreground"
            >
              R/01
            </span>
            <span
              aria-hidden="true"
              className="h-3.5 w-px bg-border"
            />
            <Wordmark />
          </Link>

          <ol className="hidden items-center gap-9 md:flex" role="list">
            {MARKETING_NAV_LINKS.map((link, idx) => {
              const isActive = pathname === link.href
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "group relative inline-flex items-center gap-2 py-1 text-sm font-medium transition-colors",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "font-mono text-[10px] tracking-[0.16em] transition-colors",
                        isActive
                          ? "text-foreground/60"
                          : "text-muted-foreground/60 group-hover:text-foreground/60",
                      )}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="relative">
                      {link.label}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "pointer-events-none absolute -bottom-1 left-0 h-px bg-foreground transition-[width,opacity] duration-300 ease-out",
                          isActive
                            ? "w-full opacity-100"
                            : "w-0 opacity-0 group-hover:w-full group-hover:opacity-60",
                        )}
                      />
                    </span>
                  </Link>
                </li>
              )
            })}
          </ol>

          <div className="hidden items-center gap-5 md:flex">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Host login
            </Link>
            <Link href="/signup" className={PRIMARY_BUTTON_CLASS}>
              Host a Reunion
              <ArrowUpRight className="size-3.5" weight="bold" />
            </Link>
          </div>

          <button
            type="button"
            className="relative inline-flex size-9 items-center justify-center rounded-md transition-colors hover:bg-[rgba(28,28,28,0.04)] md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileMenuOpen}
            aria-controls="marketing-mobile-menu"
          >
            {mobileMenuOpen ? (
              <X className="size-5" weight="bold" />
            ) : (
              <List className="size-5" weight="bold" />
            )}
          </button>
        </nav>
      </header>

      <div
        id="marketing-mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={cn(
          "fixed inset-0 top-16 z-30 flex flex-col bg-background transition-[opacity,transform] duration-300 ease-out md:hidden",
          mobileMenuOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        <div className="flex flex-1 flex-col px-6 pt-12">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Reunion Projects · Vol. 01
          </p>

          <ol className="mt-10 flex flex-col gap-6" role="list">
            {MARKETING_NAV_LINKS.map((link, idx) => {
              const isActive = pathname === link.href
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="group flex items-baseline gap-4"
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span
                      aria-hidden="true"
                      className="w-7 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground"
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "font-heading text-4xl font-bold leading-[1.05] tracking-tight transition-colors",
                        isActive
                          ? "text-foreground"
                          : "text-foreground/70 group-hover:text-foreground",
                      )}
                    >
                      {link.label}
                      {isActive ? (
                        <span
                          aria-hidden="true"
                          className="ml-2 font-normal italic text-foreground/60"
                        >
                          ·
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ol>

          <div className="mt-auto pb-10">
            <div className="flex flex-col gap-4 border-t border-border pt-8">
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-12 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-[rgba(255,255,255,0.2)_0px_0.5px_0px_0px_inset,rgba(0,0,0,0.2)_0px_0px_0px_0.5px_inset,rgba(0,0,0,0.05)_0px_1px_2px_0px] transition-all hover:opacity-85 active:translate-y-px"
              >
                Host a Reunion
                <ArrowUpRight className="size-4" weight="bold" />
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Already a host? Log in
              </Link>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                A Reunion Projects platform · Currently in private beta
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
