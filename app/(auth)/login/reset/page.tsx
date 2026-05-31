import type { Metadata } from "next"

import { ResetPasswordForm } from "./reset-password-form"

export const metadata: Metadata = {
  title: "Reset password",
  description: "Request a password reset link for The Reunion Projects.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/login/reset" },
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
