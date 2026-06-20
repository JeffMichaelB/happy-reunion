import { decryptToken } from "@/lib/crypto/tokens"
import { createAdminClient } from "@/lib/supabase/admin"

const CALCOM_API_BASE = "https://api.cal.com/v2"

// Cal.com v2 API versions vary per endpoint. The "stable" version for
// listing /event-types and /webhooks with a personal API key is 2024-06-14.
// /me works with any recent version.
const API_VERSION = "2024-06-14"

type AuthResolution = { kind: "api_key"; token: string; source: "env" | "db" }

function getEnvApiKey(): string | null {
  const key = process.env.CALCOM_API_KEY?.trim()
  return key && key.length > 0 ? key : null
}

async function getAuth(userId: string): Promise<AuthResolution> {
  const admin = createAdminClient()
  const { data } = await admin
    .from("host_calcom_credentials")
    .select("api_key_encrypted")
    .eq("user_id", userId)
    .maybeSingle()

  if (data?.api_key_encrypted) {
    return {
      kind: "api_key",
      token: decryptToken(data.api_key_encrypted),
      source: "db",
    }
  }

  const envKey = getEnvApiKey()
  if (envKey) {
    return { kind: "api_key", token: envKey, source: "env" }
  }

  throw new Error("Cal.com not connected")
}

/**
 * A host is connected when scheduling will actually work end to end: they have
 * a usable API key (their own stored key, or the shared env key) AND a booking
 * URL guests can open. Used to gate onboarding.
 */
export async function isConnected(userId: string): Promise<boolean> {
  const admin = createAdminClient()
  const { data: creds } = await admin
    .from("host_calcom_credentials")
    .select("api_key_encrypted")
    .eq("user_id", userId)
    .maybeSingle()

  const hasKey = !!creds?.api_key_encrypted || isEnvKeyConfigured()
  if (!hasKey) return false

  const { data: profile } = await admin
    .from("profiles")
    .select("cal_com_booking_url")
    .eq("id", userId)
    .single()

  const bookingUrl = profile?.cal_com_booking_url ?? getEnvBookingUrl()
  return !!bookingUrl
}

function headers(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "cal-api-version": API_VERSION,
  }
}

export function isEnvKeyConfigured(): boolean {
  return getEnvApiKey() !== null
}

export function getEnvBookingUrl(): string | null {
  const url = process.env.CALCOM_BOOKING_URL?.trim()
  return url && url.length > 0 ? url : null
}

export async function verifyApiKey(
  apiKey: string,
): Promise<{ username: string } | null> {
  const res = await fetch(`${CALCOM_API_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "cal-api-version": API_VERSION,
    },
  })
  if (!res.ok) return null
  const json = await res.json()
  const username = json.data?.username ?? json.data?.name ?? null
  return username ? { username } : { username: "" }
}

export type CalEventType = {
  id: number
  slug: string
  title: string
  length: number
  bookingUrl: string | null
}

export async function getEventTypes(userId: string): Promise<CalEventType[]> {
  const auth = await getAuth(userId)

  // For a personal API key, /event-types must be scoped by username.
  let url = `${CALCOM_API_BASE}/event-types`
  const profile = await getProfileForToken(auth.token)
  if (profile?.username) {
    url = `${CALCOM_API_BASE}/event-types?username=${encodeURIComponent(profile.username)}`
  }

  const res = await fetch(url, { headers: headers(auth.token) })
  if (!res.ok) return []
  const json = await res.json()
  const items: Array<Record<string, unknown>> =
    (json.data?.eventTypes as Array<Record<string, unknown>>) ??
    (Array.isArray(json.data)
      ? (json.data as Array<Record<string, unknown>>)
      : [])
  return items.map((et) => ({
    id: et.id as number,
    slug: et.slug as string,
    title: et.title as string,
    length: (et.length ?? et.lengthInMinutes) as number,
    bookingUrl: (et.bookingUrl as string | undefined) ?? null,
  }))
}

async function getProfileForToken(
  token: string,
): Promise<{ username: string } | null> {
  const res = await fetch(`${CALCOM_API_BASE}/me`, {
    headers: headers(token),
  })
  if (!res.ok) return null
  const json = await res.json()
  return { username: json.data?.username ?? json.data?.name ?? "" }
}

export async function getProfile(
  userId: string,
): Promise<{ username: string } | null> {
  const auth = await getAuth(userId)
  return getProfileForToken(auth.token)
}

/**
 * Registers a webhook against the user's Cal.com account.
 *
 * Personal API keys use the account-level POST /v2/webhooks endpoint (not
 * the OAuth-managed-user POST /event-types/{id}/webhooks endpoint). The
 * registered webhook fires for all bookings on the account by default; we
 * optionally scope it to one event type via the `eventTypeIds` field.
 */
export async function createWebhook(
  userId: string,
  eventTypeId: number,
  subscriberUrl: string,
  secret: string,
): Promise<string | null> {
  const auth = await getAuth(userId)

  const body = {
    active: true,
    subscriberUrl,
    triggers: [
      "BOOKING_CREATED",
      "BOOKING_RESCHEDULED",
      "BOOKING_CANCELLED",
    ],
    payloadTemplate: null as string | null,
    secret,
    eventTypeIds: [eventTypeId],
  }

  const res = await fetch(`${CALCOM_API_BASE}/webhooks`, {
    method: "POST",
    headers: headers(auth.token),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    console.error("Cal.com webhook create failed:", res.status, await res.text())
    return null
  }
  const json = await res.json()
  return (
    (json.data?.id as string | number | undefined)?.toString() ??
    (json.data?.webhookId as string | undefined) ??
    null
  )
}

export async function deleteWebhook(
  userId: string,
  _eventTypeId: number,
  webhookId: string,
): Promise<void> {
  const auth = await getAuth(userId)
  await fetch(`${CALCOM_API_BASE}/webhooks/${webhookId}`, {
    method: "DELETE",
    headers: headers(auth.token),
  })
}

export async function cancelBooking(
  userId: string,
  bookingUid: string,
  reason?: string,
): Promise<boolean> {
  const auth = await getAuth(userId)
  const res = await fetch(
    `${CALCOM_API_BASE}/bookings/${bookingUid}/cancel`,
    {
      method: "POST",
      headers: headers(auth.token),
      body: JSON.stringify({
        cancellationReason: reason ?? "Cancelled by host",
      }),
    },
  )
  return res.ok
}

export async function rescheduleBooking(
  userId: string,
  bookingUid: string,
  newStart: string,
  reason?: string,
): Promise<boolean> {
  const auth = await getAuth(userId)
  const res = await fetch(
    `${CALCOM_API_BASE}/bookings/${bookingUid}/reschedule`,
    {
      method: "POST",
      headers: headers(auth.token),
      body: JSON.stringify({
        start: newStart,
        rescheduleReason: reason ?? "Rescheduled by host",
      }),
    },
  )
  return res.ok
}
