import Link from "next/link"

interface AuthCodeErrorPageProps {
  searchParams: Promise<{ reason?: string }>
}

export default async function AuthCodeErrorPage({
  searchParams,
}: AuthCodeErrorPageProps) {
  const { reason } = await searchParams

  const message =
    reason === "invalid_or_expired"
      ? "This link is invalid or has expired. Request a new reset link from sign in."
      : reason === "missing_token"
        ? "This link is missing required parameters. Use the full link from your email."
        : "We could not complete sign-in. Try again or request a new password reset."

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-xl font-medium">Sign-in failed</h1>
      <p className="text-muted-foreground text-sm">{message}</p>
      <Link href="/login" className="text-sm underline underline-offset-4">
        Back to sign in
      </Link>
    </main>
  )
}
