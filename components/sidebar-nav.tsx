"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SquaresFour,
  Users,
  Microphone,
  CalendarBlank,
  BookOpenText,
  GearSix,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

const navItems = [
  { href: "/host/dashboard", label: "Dashboard", icon: SquaresFour },
  { href: "/host/guests", label: "Guests", icon: Users },
  { href: "/host/episodes", label: "Reunions", icon: Microphone },
  { href: "/host/calendar", label: "Calendar", icon: CalendarBlank },
  { href: "/host/resources", label: "Resources", icon: BookOpenText },
  { href: "/host/settings", label: "Settings", icon: GearSix },
] as const

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Host navigation"
      className="-mx-4 flex flex-1 snap-x snap-mandatory gap-1 overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] md:mx-0 md:snap-none md:flex-col md:items-stretch md:overflow-x-visible md:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex shrink-0 snap-start items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors",
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
