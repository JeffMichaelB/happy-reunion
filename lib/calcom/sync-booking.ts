import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/database.types"
import { isEmailConfigured, sendEmail } from "@/lib/email/resend"
import { findOrCreateGuestId } from "@/lib/guests/link"

type Admin = SupabaseClient<Database>

/**
 * Normalized view of a Cal.com booking, shared by the webhook handler and the
 * polling fallback so both write through the same idempotent path.
 */
export type CalBooking = {
  uid: string
  title: string | null
  startTime: string | null
  endTime: string | null
  guestEmail: string | null
  guestName: string | null
  /** Present on reschedule events: the uid of the booking being replaced. */
  rescheduleUid: string | null
}

const UNIQUE_VIOLATION = "23505"

/**
 * Creates or updates the booking for `cal_com_booking_uid`. Idempotent: a
 * duplicate webhook delivery updates the existing row instead of inserting a
 * second one, and a concurrent insert that loses the unique-index race is
 * treated as success rather than an error.
 *
 * Returns true when a new booking row was inserted (used to gate the host
 * notification so reschedules/replays don't re-notify).
 */
export async function syncBookingCreated(
  admin: Admin,
  hostId: string,
  booking: CalBooking,
): Promise<boolean> {
  const guestId = await findOrCreateGuestId(
    admin,
    hostId,
    booking.guestEmail,
    booking.guestName,
  )

  const { data: updated } = await admin
    .from("bookings")
    .update({
      guest_id: guestId,
      guest_email: booking.guestEmail ?? "unknown@guest.com",
      guest_name: booking.guestName ?? "Guest",
      starts_at: booking.startTime,
      ends_at: booking.endTime,
      topic: booking.title,
      status: "confirmed",
      updated_at: new Date().toISOString(),
    })
    .eq("host_id", hostId)
    .eq("cal_com_booking_uid", booking.uid)
    .select("id")

  if (updated && updated.length > 0) return false

  const { error } = await admin.from("bookings").insert({
    host_id: hostId,
    guest_id: guestId,
    guest_email: booking.guestEmail ?? "unknown@guest.com",
    guest_name: booking.guestName ?? "Guest",
    starts_at: booking.startTime,
    ends_at: booking.endTime,
    topic: booking.title,
    status: "confirmed",
    cal_com_booking_uid: booking.uid,
  })

  if (error) {
    if (error.code === UNIQUE_VIOLATION) return false
    throw new Error(error.message)
  }

  return true
}

export async function syncBookingRescheduled(
  admin: Admin,
  hostId: string,
  booking: CalBooking,
): Promise<void> {
  const lookupUid = booking.rescheduleUid ?? booking.uid
  await admin
    .from("bookings")
    .update({
      starts_at: booking.startTime,
      ends_at: booking.endTime,
      cal_com_booking_uid: booking.uid,
      updated_at: new Date().toISOString(),
    })
    .eq("host_id", hostId)
    .eq("cal_com_booking_uid", lookupUid)
}

export async function syncBookingCancelled(
  admin: Admin,
  hostId: string,
  uid: string,
): Promise<void> {
  await admin
    .from("bookings")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("host_id", hostId)
    .eq("cal_com_booking_uid", uid)
}

/**
 * Emails the host that a guest booked, and logs the send. Best-effort: when
 * Resend is not configured or the send fails, this is a no-op so booking sync
 * is never blocked on notification delivery.
 */
export async function notifyHostOfBooking(
  admin: Admin,
  hostId: string,
  booking: CalBooking,
): Promise<void> {
  if (!isEmailConfigured()) return

  const { data: hostUser } = await admin.auth.admin.getUserById(hostId)
  const hostEmail = hostUser?.user?.email
  if (!hostEmail) return

  const guestLabel = booking.guestName ?? booking.guestEmail ?? "A guest"
  const when = booking.startTime
    ? new Date(booking.startTime).toLocaleString("en-US", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : "an upcoming time"
  const subject = `New booking: ${guestLabel}`
  const body = [
    `${guestLabel} just booked a reunion with you.`,
    `When: ${when}`,
    booking.guestEmail ? `Guest email: ${booking.guestEmail}` : null,
    booking.title ? `Topic: ${booking.title}` : null,
    `View it in your dashboard.`,
  ]
    .filter(Boolean)
    .join("\n\n")

  try {
    await sendEmail({
      to: hostEmail,
      subject,
      body,
      idempotencyScope: `calcom-booking/${booking.uid}`,
    })
  } catch {
    return
  }

  await admin.from("email_sends").insert({
    host_id: hostId,
    recipient_email: hostEmail,
    subject,
  })
}
