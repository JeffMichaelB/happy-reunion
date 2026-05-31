import type { Metadata } from "next"
import Link from "next/link"

import { EmailPasswordForm } from "../_components/email-password-form"

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your host account on The Reunion Projects.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/signup" },
}

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          Create your host account
        </h1>
        <p className="text-sm text-muted-foreground">
          A few minutes to set up.
        </p>
      </div>

      <EmailPasswordForm mode="signup" />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
