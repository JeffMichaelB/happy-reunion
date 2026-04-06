import Link from "next/link"
import { redirect } from "next/navigation"

import { buttonVariants } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/host/pipeline", label: "Pipeline" },
  { href: "/host/bookings", label: "Bookings" },
  { href: "/host/calendar", label: "Calendar" },
  { href: "/host/templates", label: "Templates" },
  { href: "/host/settings", label: "Settings" },
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
      <aside className="border-border flex flex-col gap-4 border-b p-4 md:w-52 md:border-r md:border-b-0">
        <div>
          <p className="text-muted-foreground text-xs font-medium">Host</p>
          <p className="font-mono text-xs break-all">{user.email}</p>
        </div>
        <nav className="flex flex-wrap gap-2 md:flex-col md:items-stretch">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "justify-start",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Home
        </Link>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
