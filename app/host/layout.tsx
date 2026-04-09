import Link from "next/link"
import { redirect } from "next/navigation"
import {
  SquaresFour,
  Users,
  Microphone,
  CalendarBlank,
  EnvelopeSimple,
  GearSix,
} from "@phosphor-icons/react/dist/ssr"

import { SignOutButton } from "@/components/sign-out-button"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/host/dashboard", label: "Dashboard", icon: SquaresFour },
  { href: "/host/guests", label: "Guests", icon: Users },
  { href: "/host/episodes", label: "Episodes", icon: Microphone },
  { href: "/host/calendar", label: "Calendar", icon: CalendarBlank },
  { href: "/host/templates", label: "Templates", icon: EnvelopeSimple },
  { href: "/host/settings", label: "Settings", icon: GearSix },
] as const

export default async function HostLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <aside className="flex flex-col border-b border-border bg-[#f3f0e8] p-4 md:w-52 md:border-b-0 md:border-r">
        <div className="mb-6">
          <p className="text-sm font-semibold tracking-tight">Happy Reunion</p>
          <p className="mt-1 font-mono text-[13px] text-muted-foreground break-all">
            {user.email}
          </p>
        </div>

        <nav className="flex flex-1 flex-wrap gap-1 md:flex-col md:items-stretch">
          {nav.map((item) => {
            const Icon = item.icon
            return (
              <NavLink key={item.href} href={item.href}>
                <Icon className="size-4" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-4 border-t border-border pt-4 md:mt-auto">
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 px-8 py-6">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}

function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
        "text-foreground hover:bg-[rgba(28,28,28,0.04)]",
      )}
    >
      {children}
    </Link>
  )
}
