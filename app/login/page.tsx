import Link from "next/link"

import { EmailPasswordForm } from "./email-password-form"
import { GoogleSignInButton } from "./google-sign-in-button"

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-xl font-medium">Sign in</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Use email and password for quick testing, or Google for Calendar/Gmail automation.
        </p>
      </div>
      <EmailPasswordForm />
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <span className="border-border w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background text-muted-foreground px-2">or</span>
        </div>
      </div>
      <GoogleSignInButton />
      <p className="text-muted-foreground text-center text-xs">
        <Link href="/" className="underline underline-offset-4">
          Back
        </Link>
      </p>
    </main>
  )
}
