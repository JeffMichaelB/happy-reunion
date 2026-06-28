"use client"

import type { EmailOtpType } from "@supabase/supabase-js"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import {
  HOST_PASSWORD_RECOVERY_DESTINATION,
  authDestinationForEvent,
  authDestinationForType,
  isPasswordRecoveryType,
} from "@/lib/auth/destinations"
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
      if (dest === HOST_PASSWORD_RECOVERY_DESTINATION) {
        window.sessionStorage.setItem("host-password-recovery", "1")
      }
      router.replace(dest)
    }

    if (token_hash && type) {
      void supabase.auth
        .verifyOtp({ token_hash, type })
        .then(({ error: e }) => {
          const destination = authDestinationForType(type)
          finish(!e, e?.message ?? null, destination)
        })
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
        finish(true, null, authDestinationForEvent(event, hashType ?? type))
      }
    })

    void supabase.auth.getSession().then(({ data: { session }, error: e }) => {
      if (e) {
        finish(false, e.message, "/login")
        return
      }
      if (session) {
        if (isPasswordRecoveryType(hashType ?? type)) {
          window.sessionStorage.setItem("host-password-recovery", "1")
        }
        finish(true, null, authDestinationForType(hashType ?? type))
      }
    })

    const timeout = window.setTimeout(() => {
      if (!finished.current && !hasAuthHash) {
        finish(false, "This link is invalid or has expired.", "/login")
      }
    }, 8000)

    return () => {
      subscription.unsubscribe()
      window.clearTimeout(timeout)
    }
  }, [router])

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Link didn&rsquo;t work
          </h1>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <Link
          href="/login/reset"
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-[rgba(255,255,255,0.2)_0px_0.5px_0px_0px_inset,rgba(0,0,0,0.2)_0px_0px_0px_0.5px_inset,rgba(0,0,0,0.05)_0px_1px_2px_0px] transition-opacity hover:opacity-85"
        >
          Request a new link
        </Link>
        <Link
          href="/login"
          className="text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return <p className="text-sm text-muted-foreground">Confirming sign-in…</p>
}
