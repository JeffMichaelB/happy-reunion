"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

const fieldClass =
  "border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"

export function EmailPasswordForm() {
  const router = useRouter()
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setPending(true)
    const supabase = createClient()

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
      })
      if (error) {
        setMessage(error.message)
        setPending(false)
        return
      }
      if (data.session) {
        router.refresh()
        router.push("/")
        return
      }
      setMessage(
        "Check your email to confirm the account (if confirmations are enabled in Supabase). You can sign in after confirming.",
      )
      setPending(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage(error.message)
      setPending(false)
      return
    }
    router.refresh()
    router.push("/")
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="flex flex-col gap-3">
      <div className="flex gap-2 text-xs">
        <button
          type="button"
          className={cn(
            "underline-offset-4",
            mode === "signin" ? "font-medium underline" : "text-muted-foreground",
          )}
          onClick={() => {
            setMode("signin")
            setMessage(null)
          }}
        >
          Sign in
        </button>
        <span className="text-muted-foreground">·</span>
        <button
          type="button"
          className={cn(
            "underline-offset-4",
            mode === "signup" ? "font-medium underline" : "text-muted-foreground",
          )}
          onClick={() => {
            setMode("signup")
            setMessage(null)
          }}
        >
          Create account
        </button>
      </div>
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-muted-foreground">Email</span>
        <input
          className={fieldClass}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span className="text-muted-foreground">Password</span>
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
      {message ? <p className="text-destructive text-xs">{message}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Working…" : mode === "signup" ? "Sign up" : "Sign in"}
      </Button>
    </form>
  )
}
