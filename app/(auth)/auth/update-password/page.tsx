import type { Metadata } from "next"

import { UpdatePasswordForm } from "./update-password-form"

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Choose a new password for your account.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/auth/update-password" },
}

export default function UpdatePasswordPage() {
  return <UpdatePasswordForm />
}
