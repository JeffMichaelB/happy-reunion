import { google } from "googleapis"
import { NextResponse } from "next/server"

import { decryptToken } from "@/lib/crypto/google-tokens"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: row, error } = await admin
    .from("host_google_credentials")
    .select("refresh_token_encrypted")
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  if (!row?.refresh_token_encrypted) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "No stored Google refresh token. Sign out and sign in again with prompt=consent to grant offline access.",
      },
      { status: 400 },
    )
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { ok: false, error: "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET on server" },
      { status: 500 },
    )
  }

  let refreshToken: string
  try {
    refreshToken = decryptToken(row.refresh_token_encrypted)
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to decrypt stored token" }, { status: 500 })
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret)
  oauth2.setCredentials({ refresh_token: refreshToken })

  try {
    const calendar = google.calendar({ version: "v3", auth: oauth2 })
    const calList = await calendar.calendarList.list({ maxResults: 5 })

    const gmail = google.gmail({ version: "v1", auth: oauth2 })
    const profile = await gmail.users.getProfile({ userId: "me" })

    return NextResponse.json({
      ok: true,
      calendar: {
        itemsReturned: calList.data.items?.length ?? 0,
      },
      gmail: {
        emailAddress: profile.data.emailAddress,
      },
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Google API error"
    return NextResponse.json({ ok: false, error: message }, { status: 502 })
  }
}
