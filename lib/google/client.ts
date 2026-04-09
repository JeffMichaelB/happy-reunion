import { google, type Auth } from "googleapis"

import { decryptToken, encryptToken } from "@/lib/crypto/google-tokens"
import { createAdminClient } from "@/lib/supabase/admin"

function getOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET")
  }
  return { clientId, clientSecret }
}

/**
 * Build an authenticated Google OAuth2 client for a host user.
 *
 * 1. Fetch encrypted credentials from host_google_credentials (service-role)
 * 2. Decrypt the refresh token
 * 3. Build the OAuth2 client
 * 4. Attach a token listener that persists refreshed access tokens back to DB
 */
export async function getGoogleClient(userId: string): Promise<Auth.OAuth2Client> {
  const { clientId, clientSecret } = getOAuthConfig()
  const admin = createAdminClient()

  const { data: row, error } = await admin
    .from("host_google_credentials")
    .select("refresh_token_encrypted, access_token_encrypted, expires_at")
    .eq("user_id", userId)
    .maybeSingle()

  if (error) throw new Error(`DB error fetching Google credentials: ${error.message}`)
  if (!row?.refresh_token_encrypted) {
    throw new Error("No stored Google refresh token. Please reconnect your Google account.")
  }

  const refreshToken = decryptToken(row.refresh_token_encrypted)

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret)

  const credentials: Auth.Credentials = { refresh_token: refreshToken }

  if (row.access_token_encrypted && row.expires_at) {
    const expiresAt = new Date(row.expires_at)
    if (expiresAt.getTime() > Date.now() + 60_000) {
      credentials.access_token = decryptToken(row.access_token_encrypted)
      credentials.expiry_date = expiresAt.getTime()
    }
  }

  oauth2.setCredentials(credentials)

  oauth2.on("tokens", async (tokens) => {
    const update: Record<string, string> = { updated_at: new Date().toISOString() }

    if (tokens.access_token) {
      update.access_token_encrypted = encryptToken(tokens.access_token)
    }
    if (tokens.expiry_date) {
      update.expires_at = new Date(tokens.expiry_date).toISOString()
    }
    if (tokens.refresh_token) {
      update.refresh_token_encrypted = encryptToken(tokens.refresh_token)
    }

    await admin
      .from("host_google_credentials")
      .update(update)
      .eq("user_id", userId)
  })

  return oauth2
}

/** Convenience: authenticated Google Calendar v3 client */
export async function getCalendarClient(userId: string) {
  const auth = await getGoogleClient(userId)
  return google.calendar({ version: "v3", auth })
}

/** Convenience: authenticated Gmail v1 client */
export async function getGmailClient(userId: string) {
  const auth = await getGoogleClient(userId)
  return google.gmail({ version: "v1", auth })
}
