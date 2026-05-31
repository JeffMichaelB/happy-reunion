"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

const fieldClass =
  "border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    void supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error || !session) {
        setMessage(
          "This reset link is invalid or has expired. Request a new link from the sign-in page.",
        )
        return
      }
      setReady(true)
    })
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.")
      return
    }
    if (password !== confirm) {
      setMessage("Passwords do not match.")
      return
    }
    setPending(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setMessage(error.message)
      setPending(false)
      return
    }
    router.refresh()
    router.replace("/host/dashboard")
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-xl font-medium">Set a new password</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Choose a password for email sign-in.
        </p>
      </div>

      {ready ? (
        <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-muted-foreground">New password</span>
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
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-muted-foreground">Confirm password</span>
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
          {message ? <p className="text-destructive text-xs">{message}</p> : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save password"}
          </Button>
        </form>
      ) : (
        <p className="text-muted-foreground text-sm">{message ?? "Loading…"}</p>
      )}

      <p className="text-muted-foreground text-center text-xs">
        <Link href="/login" className="underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </main>
  )
}
