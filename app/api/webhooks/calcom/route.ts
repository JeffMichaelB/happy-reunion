import { createHmac, timingSafeEqual } from "node:crypto"

import { NextResponse } from "next/server"

import {
  type CalBooking,
  notifyHostOfBooking,
  syncBookingCancelled,
  syncBookingCreated,
  syncBookingRescheduled,
} from "@/lib/calcom/sync-booking"
import { decryptToken } from "@/lib/crypto/tokens"
import { createAdminClient } from "@/lib/supabase/admin"

function signatureMatches(payload: string, secret: string, signature: string): boolean {
  const expected = createHmac("sha256", secret).update(payload).digest("hex")
  try {
    return timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(expected, "utf8"),
    )
  } catch {
    return false
  }
}

type CalComPayload = {
  triggerEvent: string
  payload: {
    uid: string
    title?: string
    startTime: string
    endTime: string
    attendees?: Array<{ name: string; email: string }>
    rescheduleUid?: string
  }
}

function toCalBooking(payload: CalComPayload["payload"]): CalBooking {
  const guest = payload.attendees?.[0]
  return {
    uid: payload.uid,
    title: payload.title ?? null,
    startTime: payload.startTime ?? null,
    endTime: payload.endTime ?? null,
    guestEmail: guest?.email ?? null,
    guestName: guest?.name ?? null,
    rescheduleUid: payload.rescheduleUid ?? null,
  }
}

export async function POST(request: Request) {
  // 1. Resolve which host this delivery is for.
  const url = new URL(request.url)
  const slug = url.searchParams.get("slug")
  if (!slug) {
    return NextResponse.json({ error: "missing slug" }, { status: 400 })
  }

  // 2. Look up the host by slug before doing anything with the body.
  const body = await request.text()
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("slug", slug)
    .single()

  if (!profile) {
    return NextResponse.json({ error: "host not found" }, { status: 404 })
  }

  const hostId = profile.id

  // 3. Verify the signature against THIS host's per-host secret.
  const { data: creds } = await admin
    .from("host_calcom_credentials")
    .select("webhook_secret_encrypted")
    .eq("user_id", hostId)
    .maybeSingle()

  const encryptedSecret = creds?.webhook_secret_encrypted
  if (!encryptedSecret) {
    return NextResponse.json({ error: "no webhook secret" }, { status: 401 })
  }

  const signature = request.headers.get("x-cal-signature-256") ?? ""
  if (!signatureMatches(body, decryptToken(encryptedSecret), signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 })
  }

  // 4. Parse and route the verified event.
  let event: CalComPayload
  try {
    event = JSON.parse(body) as CalComPayload
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  const booking = toCalBooking(event.payload)

  switch (event.triggerEvent) {
    case "BOOKING_CREATED": {
      const created = await syncBookingCreated(admin, hostId, booking)
      if (created) {
        await notifyHostOfBooking(admin, hostId, booking)
      }
      break
    }

    case "BOOKING_RESCHEDULED": {
      await syncBookingRescheduled(admin, hostId, booking)
      break
    }

    case "BOOKING_CANCELLED": {
      await syncBookingCancelled(admin, hostId, booking.uid)
      break
    }

    default:
      break
  }

  return NextResponse.json({ ok: true })
}
