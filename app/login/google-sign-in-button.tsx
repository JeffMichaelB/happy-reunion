"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { GOOGLE_OAUTH_SCOPES } from "@/lib/google-scopes"

export function GoogleSignInButton() {
  const [pending, setPending] = useState(false)

  async function signIn() {
    setPending(true)
    const supabase = createClient()
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ?? (typeof window !== "undefined" ? window.location.origin : "")
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
        scopes: GOOGLE_OAUTH_SCOPES,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    })
    if (error) {
      console.error(error.message)
      setPending(false)
    }
  }

  return (
    <Button type="button" disabled={pending} onClick={() => void signIn()}>
      {pending ? "Redirecting…" : "Continue with Google"}
    </Button>
  )
}
