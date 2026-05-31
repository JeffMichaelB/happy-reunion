import type { Metadata } from "next"
import Link from "next/link"

import { EmailPasswordForm } from "../_components/email-password-form"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to The Reunion Projects.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/login" },
}

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
        Sign in
      </h1>

      <EmailPasswordForm mode="signin" />

      <p className="text-center text-sm text-muted-foreground">
        Don&rsquo;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Create one
        </Link>
      </p>
    </div>
  )
}
