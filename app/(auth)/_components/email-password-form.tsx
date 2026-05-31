"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

const fieldClass =
  "border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2"

const POST_AUTH_DESTINATION = "/host/dashboard"

interface EmailPasswordFormProps {
  mode: "signin" | "signup"
}

export function EmailPasswordForm({ mode }: EmailPasswordFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setPending(true)
    const supabase = createClient()

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
      })
      if (signUpError) {
        setError(signUpError.message)
        setPending(false)
        return
      }
      if (data.session) {
        router.refresh()
        router.push(POST_AUTH_DESTINATION)
        return
      }
      setNotice(
        "Check your email to confirm the account, then sign in.",
      )
      setPending(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "That email and password don't match."
          : signInError.message,
      )
      setPending(false)
      return
    }
    router.refresh()
    router.push(POST_AUTH_DESTINATION)
  }

  const submitLabel = mode === "signup" ? "Create account" : "Sign in"
  const pendingLabel = mode === "signup" ? "Creating account…" : "Signing in…"

  return (
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
      <label className="flex flex-col gap-1.5 text-sm">
        <div className="flex items-baseline justify-between">
          <span className="font-medium text-foreground">Password</span>
          {mode === "signin" ? (
            <Link
              href="/login/reset"
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Forgot password?
            </Link>
          ) : null}
        </div>
        <input
          className={fieldClass}
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      {notice ? <p className="text-muted-foreground text-sm">{notice}</p> : null}
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? pendingLabel : submitLabel}
      </Button>
    </form>
  )
}
