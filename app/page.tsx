import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

import { SignOutButton } from "./sign-out-button"

export default async function Page() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-svh flex-col gap-6 p-6">
      <div className="flex max-w-lg flex-col gap-3 text-sm leading-relaxed">
        <h1 className="text-lg font-medium">Happy Reunion — Phase 1</h1>
        {user ? (
          <>
            <p>
              Signed in as <span className="font-mono text-xs">{user.email}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/host"
                className={cn(buttonVariants({ variant: "default" }))}
              >
                Host dashboard
              </Link>
              <Link
                href="/api/google/verify"
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Verify Google APIs
              </Link>
              <SignOutButton />
            </div>
            <p className="text-muted-foreground text-xs">
              Opens a JSON check that Calendar list + Gmail profile work with stored tokens.
            </p>
          </>
        ) : (
          <>
            <p className="text-muted-foreground">Not signed in.</p>
            <Link href="/login" className={cn(buttonVariants({ variant: "default" }))}>
              Sign in with Google
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
