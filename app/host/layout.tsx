import { redirect } from "next/navigation"

import { SidebarNav } from "@/components/sidebar-nav"
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

  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <aside className="flex flex-col border-b border-border bg-[#f3f0e8] p-4 md:w-52 md:border-b-0 md:border-r">
        <div className="mb-6">
          <p className="text-sm font-semibold tracking-tight">
            The <span className="font-normal italic">Reunion</span> Projects
          </p>
          <p className="mt-1 font-mono text-[12px] text-muted-foreground break-all">
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
