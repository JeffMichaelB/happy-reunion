import type { Metadata } from "next"
import Link from "next/link"

import { EmailPasswordForm } from "./email-password-form"

interface LoginPageProps {
  searchParams: Promise<{ mode?: string }>
}

export async function generateMetadata({
  searchParams,
}: LoginPageProps): Promise<Metadata> {
  const { mode } = await searchParams
  const isSignup = mode === "signup"
  return {
    title: isSignup ? "Create account" : "Sign in",
    description: isSignup
      ? "Create your host account on The Reunion Projects."
      : "Sign in to The Reunion Projects.",
    robots: { index: false, follow: true },
    alternates: { canonical: "/login" },
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { mode } = await searchParams
  const isSignup = mode === "signup"

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-8 p-6">
      <div>
        <Link href="/" className="inline-block">
          <span className="font-heading text-base font-bold tracking-tight text-foreground">
            The <span className="font-normal italic">Reunion</span> Projects
          </span>
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-medium">
          {isSignup ? "Create your host account" : "Sign in"}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {isSignup
            ? "Hosting takes a few minutes to set up."
            : "Sign in with your email and password."}
        </p>
      </div>

      <EmailPasswordForm defaultMode={isSignup ? "signup" : "signin"} />

      <p className="text-muted-foreground text-center text-xs">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link
              href="/login?mode=signup"
              className="underline underline-offset-4"
            >
              Create an account
            </Link>
          </>
        )}
      </p>

      <p className="text-muted-foreground text-center text-xs">
        <Link href="/" className="underline underline-offset-4">
          Back to home
        </Link>
      </p>
    </main>
  )
}
