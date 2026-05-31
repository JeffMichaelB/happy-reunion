import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Link didn't work",
  robots: { index: false, follow: false },
}

interface AuthCodeErrorPageProps {
  searchParams: Promise<{ reason?: string }>
}

export default async function AuthCodeErrorPage({
  searchParams,
}: AuthCodeErrorPageProps) {
  const { reason } = await searchParams

  const message =
    reason === "invalid_or_expired"
      ? "This link is invalid or has expired. Request a new one and try again."
      : reason === "missing_token"
        ? "This link is missing required parameters. Use the full link from your email."
        : "We couldn't complete sign-in. Try again, or request a new password reset."

  const showResetCta = reason === "invalid_or_expired"

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          Link didn&rsquo;t work
        </h1>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>

      <div className="flex flex-col gap-3">
        {showResetCta ? (
          <Link
            href="/login/reset"
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-[rgba(255,255,255,0.2)_0px_0.5px_0px_0px_inset,rgba(0,0,0,0.2)_0px_0px_0px_0.5px_inset,rgba(0,0,0,0.05)_0px_1px_2px_0px] transition-opacity hover:opacity-85"
          >
            Request a new link
          </Link>
        ) : (
          <Link
            href="/login"
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-[rgba(255,255,255,0.2)_0px_0.5px_0px_0px_inset,rgba(0,0,0,0.2)_0px_0px_0px_0.5px_inset,rgba(0,0,0,0.05)_0px_1px_2px_0px] transition-opacity hover:opacity-85"
          >
            Back to sign in
          </Link>
        )}
        {showResetCta ? (
          <Link
            href="/login"
            className="text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Back to sign in
          </Link>
        ) : null}
      </div>
    </div>
  )
}
