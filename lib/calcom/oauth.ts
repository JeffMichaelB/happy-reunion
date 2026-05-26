const CALCOM_API_BASE = "https://api.cal.com/v2"
const CALCOM_AUTH_BASE = "https://app.cal.com"
const API_VERSION = "2024-08-13"

function getClientId(): string {
  const id = process.env.CALCOM_OAUTH_CLIENT_ID
  if (!id) throw new Error("CALCOM_OAUTH_CLIENT_ID is not set")
  return id
}

function getClientSecret(): string {
  const secret = process.env.CALCOM_OAUTH_CLIENT_SECRET
  if (!secret) throw new Error("CALCOM_OAUTH_CLIENT_SECRET is not set")
  return secret
}

const SCOPES = [
  "BOOKING_READ",
  "BOOKING_WRITE",
  "WEBHOOK_READ",
  "WEBHOOK_WRITE",
  "EVENT_TYPE_READ",
  "SCHEDULE_READ",
  "PROFILE_READ",
].join(" ")

export function buildAuthorizeUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: getClientId(),
    redirect_uri: redirectUri,
    state,
    scope: SCOPES,
    response_type: "code",
  })
  return `${CALCOM_AUTH_BASE}/auth/oauth2/authorize?${params.toString()}`
}

export type CalComTokens = {
  access_token: string
  refresh_token: string
  expires_in: number
}

export async function exchangeCode(
  code: string,
  redirectUri: string,
): Promise<CalComTokens> {
  const res = await fetch(`${CALCOM_API_BASE}/auth/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: getClientId(),
      client_secret: getClientSecret(),
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Cal.com token exchange failed: ${res.status} ${text}`)
  }

  const data = await res.json()
  return data as CalComTokens
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<CalComTokens> {
  const res = await fetch(`${CALCOM_API_BASE}/auth/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: getClientId(),
      client_secret: getClientSecret(),
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Cal.com token refresh failed: ${res.status} ${text}`)
  }

  const data = await res.json()
  return data as CalComTokens
}

export { API_VERSION, CALCOM_API_BASE }
