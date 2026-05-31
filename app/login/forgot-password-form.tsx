"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

const fieldClass =
  "border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"

function authRedirectOrigin() {
  return (
    (typeof window !== "undefined" ? window.location.origin : "") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    ""
  )
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [open, setOpen] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setPending(true)
    const supabase = createClient()
    const redirectTo = `${authRedirectOrigin()}/auth/confirm`
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })
    setPending(false)
    if (error) {
      setMessage(error.message)
      return
    }
    setMessage(
      "If that email is registered, we sent a reset link. Open it once — links expire quickly.",
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        className="text-muted-foreground text-xs underline underline-offset-4"
        onClick={() => setOpen(true)}
      >
        Forgot password?
      </button>
    )
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-2">
      <p className="text-muted-foreground text-xs">
        Enter your email for a reset link.
      </p>
      <input
        className={fieldClass}
        type="email"
        autoComplete="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {message ? (
        <p
          className={
            message.startsWith("If that email")
              ? "text-muted-foreground text-xs"
              : "text-destructive text-xs"
          }
        >
          {message}
        </p>
      ) : null}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Sending…" : "Send reset link"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setOpen(false)
            setMessage(null)
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
