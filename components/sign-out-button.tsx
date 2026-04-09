"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { SignOut } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function SignOutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function signOut() {
    setPending(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    setPending(false)
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => void signOut()}
      className="justify-start gap-2 text-muted-foreground"
    >
      <SignOut className="size-4" />
      {pending ? "Signing out..." : "Sign out"}
    </Button>
  )
}
