import type { Metadata } from "next"

import { RecoveryConfirm } from "./recovery-confirm"

export const metadata: Metadata = {
  title: "Confirm password reset",
  description: "Confirm your password reset link.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/auth/recovery" },
}

export default function AuthRecoveryPage() {
  return <RecoveryConfirm />
}
