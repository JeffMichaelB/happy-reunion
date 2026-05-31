"use client"

import type { EmailOtpType } from "@supabase/supabase-js"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { authDestinationForType } from "@/lib/auth/destinations"
import { createClient } from "@/lib/supabase/client"

export default function AuthConfirmPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const finished = useRef(false)

  useEffect(() => {
    const supabase = createClient()
    const params = new URLSearchParams(window.location.search)
    const token_hash = params.get("token_hash")
    const type = params.get("type") as EmailOtpType | null

    function finish(ok: boolean, errMsg: string | null, dest: string) {
      if (finished.current) return
      finished.current = true
      if (!ok) {
        setError(errMsg ?? "Could not confirm sign-in.")
        return
      }
      router.replace(dest)
    }

    if (token_hash && type) {
      void supabase.auth
        .verifyOtp({ token_hash, type })
        .then(({ error: e }) =>
          finish(!e, e?.message ?? null, authDestinationForType(type)),
        )
      return
    }

    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    const hashType = hashParams.get("type")
    const hasAuthHash =
      hashParams.has("access_token") || hashParams.has("refresh_token")

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        session &&
        (event === "SIGNED_IN" ||
          event === "PASSWORD_RECOVERY" ||
          event === "TOKEN_REFRESHED" ||
          event === "INITIAL_SESSION")
      ) {
        finish(
          true,
          null,
          authDestinationForType(hashType ?? type),
        )
      }
    })

    void supabase.auth.getSession().then(({ data: { session }, error: e }) => {
      if (e) {
        finish(false, e.message, "/login")
        return
      }
      if (session) {
        finish(true, null, authDestinationForType(hashType ?? type))
      }
    })

    const timeout = window.setTimeout(() => {
      if (!finished.current && !hasAuthHash) {
        finish(
          false,
          "This link is invalid or has expired.",
          "/login",
        )
      }
    }, 8000)

    return () => {
      subscription.unsubscribe()
      window.clearTimeout(timeout)
    }
  }, [router])

  if (error) {
    return (
      <main className="mx-auto max-w-sm p-6 text-sm">
        <p className="text-destructive">{error}</p>
        <p className="text-muted-foreground mt-2 text-xs">
          Request a new reset link from sign in.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-xs underline underline-offset-4"
        >
          Back to sign in
        </Link>
      </main>
    )
  }

  return (
    <main className="text-muted-foreground mx-auto max-w-sm p-6 text-sm">
      Confirming sign-in…
    </main>
  )
}
