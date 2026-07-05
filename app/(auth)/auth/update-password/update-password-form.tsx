"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

const fieldClass =
  "border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"

export function UpdatePasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [ready, setReady] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const urlSearchParams = new URLSearchParams(window.location.search)
    const urlHashParams = new URLSearchParams(window.location.hash.slice(1))
    const hasRecoveryHandoff =
      urlSearchParams.get("recovery") === "1" ||
      window.sessionStorage.getItem("host-password-recovery") === "1" ||
      urlHashParams.get("type") === "recovery"

    void supabase.auth
      .getSession()
      .then(({ data: { session }, error: sessionError }) => {
        if (sessionError || !session) {
          setLinkError(
            "This reset link is invalid or has expired. Request a new one from sign in."
          )
          return
        }
        if (!hasRecoveryHandoff) {
          setLinkError(
            "Request a password reset link before setting a new password."
          )
          return
        }
        window.sessionStorage.setItem("host-password-recovery", "1")
        setReady(true)
      })
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords don't match.")
      return
    }
    setPending(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError(updateError.message)
      setPending(false)
      return
    }
    window.sessionStorage.removeItem("host-password-recovery")
    router.refresh()
    router.replace("/host/dashboard")
  }

  if (linkError) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          Link didn&rsquo;t work
        </h1>
        <p className="text-sm text-muted-foreground">{linkError}</p>
        <div className="flex flex-col gap-3">
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
      </div>
    )
  }

  if (!ready) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
        Set a new password
      </h1>

      <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">New password</span>
          <input
            className={fieldClass}
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Confirm password</span>
          <input
            className={fieldClass}
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending ? "Saving…" : "Save password"}
        </Button>
      </form>
    </div>
  )
}
