import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

import { SidebarNav } from "@/components/sidebar-nav"
import { isConnected } from "@/lib/calcom/api"
import { ONBOARDING_SKIP_COOKIE } from "@/lib/calcom/onboarding"
import { createClient } from "@/lib/supabase/server"

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

  // Gate unconnected hosts toward onboarding. Skip the gate on the onboarding
  // route itself (no redirect loop) and when the host chose "I'll do this
  // later" (cookie set), in which case the dashboard shows a connect banner.
  const requestHeaders = await headers()
  const pathname = requestHeaders.get("x-pathname") ?? ""
  if (!pathname.startsWith("/host/onboarding")) {
    const cookieStore = await cookies()
    const skipped = cookieStore.get(ONBOARDING_SKIP_COOKIE)?.value === "1"
    if (!skipped && !(await isConnected(user.id))) {
      redirect("/host/onboarding")
    }
  }

  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <aside className="flex flex-col border-b border-border bg-[#f3f0e8] p-4 md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <div className="mb-6">
          <p className="text-sm font-semibold tracking-tight">
            The <span className="font-normal italic">Reunion</span> Projects
          </p>
          <p className="mt-1 font-mono text-[12px] text-muted-foreground">
            {user.email}
          </p>
        </div>

        <SidebarNav />
      </aside>

      <main className="flex-1 px-8 py-6">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}
