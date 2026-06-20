"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { verifyApiKey } from "@/lib/calcom/api"
import { ONBOARDING_SKIP_COOKIE } from "@/lib/calcom/onboarding"
import { encryptToken } from "@/lib/crypto/tokens"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

import { selectEventType } from "../settings/actions"

const SKIP_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

export async function connectApiKey(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const raw = String(formData.get("api_key") ?? "").trim()
  if (raw.length < 8) {
    redirect("/host/onboarding?step=key&error=invalid")
  }

  const verified = await verifyApiKey(raw)
  if (!verified) {
    redirect("/host/onboarding?step=key&error=invalid")
  }

  const admin = createAdminClient()
  await admin.from("host_calcom_credentials").upsert(
    {
      user_id: user.id,
      api_key_encrypted: encryptToken(raw),
      calcom_username: verified.username || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  )

  redirect("/host/onboarding?step=event")
}

export async function chooseEventType(formData: FormData) {
  await selectEventType(formData)
  redirect("/host/onboarding?step=done")
}

export async function skipOnboarding() {
  const cookieStore = await cookies()
  cookieStore.set(ONBOARDING_SKIP_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SKIP_COOKIE_MAX_AGE,
  })
  redirect("/host/dashboard")
}

export async function finishOnboarding() {
  // Clear any earlier skip so the gate stops firing now that the host is set up.
  const cookieStore = await cookies()
  cookieStore.delete(ONBOARDING_SKIP_COOKIE)
  redirect("/host/dashboard")
}
