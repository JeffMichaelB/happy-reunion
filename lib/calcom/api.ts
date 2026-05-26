import { decryptToken, encryptToken } from "@/lib/crypto/tokens"

import {
  API_VERSION,
  CALCOM_API_BASE,
  refreshAccessToken,
} from "./oauth"
import { createAdminClient } from "@/lib/supabase/admin"

async function getAccessToken(userId: string): Promise<string> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("host_calcom_credentials")
    .select(
      "access_token_encrypted, refresh_token_encrypted, expires_at",
    )
    .eq("user_id", userId)
    .single()

  if (error || !data) {
    throw new Error("Cal.com not connected")
  }

  const now = new Date()
  const expiresAt = data.expires_at ? new Date(data.expires_at) : null

  if (expiresAt && expiresAt > now) {
    return decryptToken(data.access_token_encrypted)
  }

  const refreshToken = decryptToken(data.refresh_token_encrypted)
  const tokens = await refreshAccessToken(refreshToken)

  const newExpiresAt = new Date(
    Date.now() + tokens.expires_in * 1000,
  ).toISOString()

  await admin
    .from("host_calcom_credentials")
    .update({
      access_token_encrypted: encryptToken(tokens.access_token),
      refresh_token_encrypted: encryptToken(tokens.refresh_token),
      expires_at: newExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)

  return tokens.access_token
}

function headers(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "cal-api-version": API_VERSION,
  }
}

export type CalEventType = {
  id: number
  slug: string
  title: string
  length: number
}

export async function getEventTypes(userId: string): Promise<CalEventType[]> {
  const token = await getAccessToken(userId)
  const res = await fetch(`${CALCOM_API_BASE}/event-types`, {
    headers: headers(token),
  })
  if (!res.ok) return []
  const json = await res.json()
  const items = json.data?.eventTypes ?? json.data ?? []
  return items.map((et: Record<string, unknown>) => ({
    id: et.id as number,
    slug: et.slug as string,
    title: et.title as string,
    length: et.length as number,
  }))
}

export async function getProfile(
  userId: string,
): Promise<{ username: string } | null> {
  const token = await getAccessToken(userId)
  const res = await fetch(`${CALCOM_API_BASE}/me`, {
    headers: headers(token),
  })
  if (!res.ok) return null
  const json = await res.json()
  return { username: json.data?.username ?? json.data?.name ?? "" }
}

export async function createWebhook(
  userId: string,
  eventTypeId: number,
  subscriberUrl: string,
  secret: string,
): Promise<string | null> {
  const token = await getAccessToken(userId)
  const res = await fetch(
    `${CALCOM_API_BASE}/event-types/${eventTypeId}/webhooks`,
    {
      method: "POST",
      headers: headers(token),
      body: JSON.stringify({
        subscriberUrl,
        triggers: [
          "BOOKING_CREATED",
          "BOOKING_RESCHEDULED",
          "BOOKING_CANCELLED",
        ],
        active: true,
        secret,
      }),
    },
  )
  if (!res.ok) return null
  const json = await res.json()
  return json.data?.id ?? json.data?.webhookId ?? null
}

export async function deleteWebhook(
  userId: string,
  eventTypeId: number,
  webhookId: string,
): Promise<void> {
  const token = await getAccessToken(userId)
  await fetch(
    `${CALCOM_API_BASE}/event-types/${eventTypeId}/webhooks/${webhookId}`,
    {
      method: "DELETE",
      headers: headers(token),
    },
  )
}

export async function cancelBooking(
  userId: string,
  bookingUid: string,
  reason?: string,
): Promise<boolean> {
  const token = await getAccessToken(userId)
  const res = await fetch(
    `${CALCOM_API_BASE}/bookings/${bookingUid}/cancel`,
    {
      method: "POST",
      headers: headers(token),
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
  const token = await getAccessToken(userId)
  const res = await fetch(
    `${CALCOM_API_BASE}/bookings/${bookingUid}/reschedule`,
    {
      method: "POST",
      headers: headers(token),
      body: JSON.stringify({
        start: newStart,
        rescheduleReason: reason ?? "Rescheduled by host",
      }),
    },
  )
  return res.ok
}
