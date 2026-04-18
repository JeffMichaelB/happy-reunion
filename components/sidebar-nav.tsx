"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SquaresFour,
  Users,
  Microphone,
  CalendarBlank,
  EnvelopeSimple,
  GearSix,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

const navItems = [
  { href: "/host/dashboard", label: "Dashboard", icon: SquaresFour },
  { href: "/host/guests", label: "Guests", icon: Users },
  { href: "/host/episodes", label: "Episodes", icon: Microphone },
  { href: "/host/calendar", label: "Calendar", icon: CalendarBlank },
  { href: "/host/templates", label: "Templates", icon: EnvelopeSimple },
  { href: "/host/settings", label: "Settings", icon: GearSix },
] as const

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-1 flex-wrap gap-1 md:flex-col md:items-stretch">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-[#1c1c1c] text-[#fcfbf8]"
                : "text-foreground/80 hover:bg-[rgba(28,28,28,0.04)] hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
