"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

import {
  HOST_PASSWORD_RECOVERY_DESTINATION,
  authDestinationForEvent,
  authDestinationForType,
  isPasswordRecoveryType,
} from "@/lib/auth/destinations"
import { createClient } from "@/lib/supabase/client"

/**
 * Supabase dashboard recovery emails often redirect to Site URL (e.g. /) with
 * tokens in the URL hash. This picks up those sessions and routes users correctly.
 */
export function AuthSessionHandler() {
  const router = useRouter()
  const handled = useRef(false)

  useEffect(() => {
    const hash = window.location.hash
    if (!hash || handled.current) return

    const hashParams = new URLSearchParams(hash.slice(1))
    const hasAuthHash =
      hashParams.has("access_token") || hashParams.has("refresh_token")
    if (!hasAuthHash) return

    const type = hashParams.get("type")
    const supabase = createClient()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (handled.current || !session) return
      if (
        event === "SIGNED_IN" ||
        event === "PASSWORD_RECOVERY" ||
        event === "INITIAL_SESSION"
      ) {
        handled.current = true
        const destination = authDestinationForEvent(event, type)
        if (destination === HOST_PASSWORD_RECOVERY_DESTINATION) {
          window.sessionStorage.setItem("host-password-recovery", "1")
        }
        router.replace(destination)
      }
    })

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (handled.current || !session) return
      handled.current = true
      if (isPasswordRecoveryType(type)) {
        window.sessionStorage.setItem("host-password-recovery", "1")
      }
      router.replace(authDestinationForType(type))
    })

    return () => subscription.unsubscribe()
  }, [router])

  return null
}
