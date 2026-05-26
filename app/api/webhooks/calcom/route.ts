import { createHmac, timingSafeEqual } from "node:crypto"

import { NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"

function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.CALCOM_WEBHOOK_SECRET
  if (!secret) return false

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

export async function POST(request: Request) {
  const url = new URL(request.url)
  const slug = url.searchParams.get("slug")
  if (!slug) {
    return NextResponse.json({ error: "missing slug" }, { status: 400 })
  }

  const body = await request.text()
  const signature = request.headers.get("x-cal-signature-256") ?? ""

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 })
  }

  let event: CalComPayload
  try {
    event = JSON.parse(body) as CalComPayload
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

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
  const { triggerEvent, payload } = event
  const uid = payload.uid
  const startsAt = payload.startTime
  const endsAt = payload.endTime
  const guest = payload.attendees?.[0]

  switch (triggerEvent) {
    case "BOOKING_CREATED": {
      await admin.from("bookings").insert({
        host_id: hostId,
        guest_email: guest?.email ?? "unknown@guest.com",
        guest_name: guest?.name ?? "Guest",
        starts_at: startsAt,
        ends_at: endsAt,
        topic: payload.title ?? null,
        status: "confirmed",
        cal_com_booking_uid: uid,
      })
      break
    }

    case "BOOKING_RESCHEDULED": {
      const lookupUid = payload.rescheduleUid ?? uid
      await admin
        .from("bookings")
        .update({
          starts_at: startsAt,
          ends_at: endsAt,
          cal_com_booking_uid: uid,
        })
        .eq("host_id", hostId)
        .eq("cal_com_booking_uid", lookupUid)
      break
    }

    case "BOOKING_CANCELLED": {
      await admin
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("host_id", hostId)
        .eq("cal_com_booking_uid", uid)
      break
    }

    default:
      break
  }

  return NextResponse.json({ ok: true })
}
