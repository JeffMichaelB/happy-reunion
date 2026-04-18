"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { createClient } from "@/lib/supabase/client"

/**
 * Landing page for email confirmation / magic links when Supabase redirects here with a session in the URL.
 */
export default function AuthConfirmPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    void supabase.auth.getSession().then(({ data: { session }, error: e }) => {
      if (e) {
        setError(e.message)
        return
      }
      if (session) {
        router.replace("/host/dashboard")
        return
      }
      setError("No session found. Try signing in again.")
    })
  }, [router])

  if (error) {
    return (
      <main className="mx-auto max-w-sm p-6 text-sm">
        <p className="text-destructive">{error}</p>
      </main>
    )
  }

  return (
    <main className="text-muted-foreground mx-auto max-w-sm p-6 text-sm">
      Confirming sign-in…
    </main>
  )
}
