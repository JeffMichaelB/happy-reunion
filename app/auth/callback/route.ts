import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import { encryptToken } from "@/lib/crypto/google-tokens"
import { GOOGLE_OAUTH_SCOPES } from "@/lib/google-scopes"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const next = url.searchParams.get("next") ?? "/host/dashboard"
  const origin = url.origin

  const response = NextResponse.redirect(`${origin}${next}`)

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  const session = data.session
  const refresh = session.provider_refresh_token
  const access = session.provider_token

  if (refresh) {
    const admin = createAdminClient()
    const refreshEncrypted = encryptToken(refresh)
    const accessEncrypted = access ? encryptToken(access) : null
    const expiresAt = session.expires_at
      ? new Date(session.expires_at * 1000).toISOString()
      : null

    const { error: upsertError } = await admin.from("host_google_credentials").upsert(
      {
        user_id: session.user.id,
        refresh_token_encrypted: refreshEncrypted,
        access_token_encrypted: accessEncrypted,
        expires_at: expiresAt,
        scopes: GOOGLE_OAUTH_SCOPES,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )

    if (upsertError) {
      console.error("host_google_credentials upsert:", upsertError.message)
    }
  }

  return response
}
