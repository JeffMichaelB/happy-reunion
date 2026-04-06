import Link from "next/link"

export default function AuthCodeErrorPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-xl font-medium">Sign-in failed</h1>
      <p className="text-muted-foreground text-sm">We could not complete the OAuth exchange.</p>
      <Link href="/login" className="text-sm underline underline-offset-4">
        Try again
      </Link>
    </main>
  )
}
