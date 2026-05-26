import { NextResponse } from "next/server"
import { cookies } from "next/headers"

import { getProfile } from "@/lib/calcom/api"
import { exchangeCode } from "@/lib/calcom/oauth"
import { encryptToken } from "@/lib/crypto/tokens"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const origin = url.origin

  const settingsUrl = `${origin}/host/settings`

  if (!code || !state) {
    return NextResponse.redirect(`${settingsUrl}?calcom=error&reason=missing_params`)
  }

  const cookieStore = await cookies()
  const storedState = cookieStore.get("calcom_oauth_state")?.value

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${settingsUrl}?calcom=error&reason=state_mismatch`)
  }

  cookieStore.delete("calcom_oauth_state")

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${origin}/login`)
  }

  const redirectUri = `${origin}/api/calcom/callback`

  let tokens
  try {
    tokens = await exchangeCode(code, redirectUri)
  } catch (err) {
    console.error("Cal.com token exchange error:", err)
    return NextResponse.redirect(`${settingsUrl}?calcom=error&reason=token_exchange`)
  }

  const expiresAt = new Date(
    Date.now() + tokens.expires_in * 1000,
  ).toISOString()

  const admin = createAdminClient()

  await admin.from("host_calcom_credentials").upsert(
    {
      user_id: user.id,
      access_token_encrypted: encryptToken(tokens.access_token),
      refresh_token_encrypted: encryptToken(tokens.refresh_token),
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  )

  try {
    const profile = await getProfile(user.id)
    if (profile?.username) {
      await admin
        .from("host_calcom_credentials")
        .update({ calcom_username: profile.username })
        .eq("user_id", user.id)
    }
  } catch {
    // non-critical
  }

  return NextResponse.redirect(`${settingsUrl}?calcom=connected`)
}
