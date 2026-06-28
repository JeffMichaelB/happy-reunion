"use client"

import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

const fieldClass =
  "border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"

function authRedirectOrigin() {
  return (
    (typeof window !== "undefined" ? window.location.origin : "") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    ""
  )
}

export function ResetPasswordForm() {
  const [email, setEmail] = useState("")
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    const supabase = createClient()
    const normalizedEmail = email.trim()
    const redirectTo = `${authRedirectOrigin()}/auth/recovery`
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      { redirectTo }
    )
    setPending(false)
    if (resetError) {
      setError(resetError.message)
      return
    }
    setSubmittedEmail(normalizedEmail)
  }

  if (submittedEmail) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Check your inbox
          </h1>
          <p className="text-sm text-muted-foreground">
            If{" "}
            <span className="font-medium text-foreground">
              {submittedEmail}
            </span>{" "}
            is on file, a reset link is on its way. Links expire in a few
            minutes.
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          Reset your password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter the email on your host account and we&rsquo;ll send a reset
          link.
        </p>
      </div>

      <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Email</span>
          <input
            className={fieldClass}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
