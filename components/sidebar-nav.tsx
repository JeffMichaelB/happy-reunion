"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SquaresFour,
  Users,
  Microphone,
  GearSix,
  CalendarBlank,
  BookOpenText,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

const primaryNavItems = [
  { href: "/host/dashboard", label: "Dashboard", icon: SquaresFour },
  { href: "/host/guests", label: "Guests", icon: Users },
  { href: "/host/episodes", label: "Reunions", icon: Microphone },
  { href: "/host/settings", label: "Settings", icon: GearSix },
] as const

const secondaryNavItems = [
  { href: "/host/calendar", label: "Calendar", icon: CalendarBlank },
  { href: "/host/resources", label: "Resources", icon: BookOpenText },
] as const

function navLinkClass(isActive: boolean, compact?: boolean) {
  return cn(
    "flex items-center transition-colors",
    compact
      ? "gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium md:px-3 md:py-2 md:text-sm"
      : "flex-col gap-1 rounded-lg px-2 py-2 text-xs font-medium md:flex-row md:gap-2 md:rounded-full md:px-3 md:py-2 md:text-sm",
    isActive
      ? compact
        ? "text-foreground"
        : "bg-[#1c1c1c] text-[#fcfbf8]"
      : compact
        ? "text-muted-foreground hover:text-foreground"
        : "text-foreground/80 hover:bg-[rgba(28,28,28,0.04)] hover:text-foreground",
  )
}

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Host navigation" className="grid grid-cols-4 gap-1 md:flex md:flex-col">
      {primaryNavItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            title={item.label}
            className={navLinkClass(isActive)}
          >
            <Icon className="size-5 md:size-4" aria-hidden />
            <span className="truncate md:truncate-none">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function SidebarNavSecondary() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="More"
      className="flex items-center justify-center gap-4 border-t border-border pt-3 md:flex-col md:items-stretch md:gap-1 md:pt-4"
    >
      {secondaryNavItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={navLinkClass(isActive, true)}
          >
            <Icon className="size-3.5" aria-hidden />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
