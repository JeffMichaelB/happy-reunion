import type { SupabaseClient } from "@supabase/supabase-js"

import { logEmailSend } from "@/lib/email/audit"
import { buildGuestBookingConfirmationEmail } from "@/lib/email/templates"
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

type BookingSyncResult = {
  created: boolean
  bookingId: string | null
}

type BookingUpdateResult = {
  bookingId: string | null
}

type LifecycleEmailTarget = "host" | "guest"
type LifecycleEmailEvent = "rescheduled" | "cancelled"

/**
 * Creates or updates the booking for `cal_com_booking_uid`. Idempotent: a
 * duplicate webhook delivery updates the existing row instead of inserting a
 * second one, and a concurrent insert that loses the unique-index race is
 * treated as success rather than an error.
 *
 * Returns whether a new booking row was inserted, plus the local booking id for
 * notification audit logs.
 */
export async function syncBookingCreated(
  admin: Admin,
  hostId: string,
  booking: CalBooking
): Promise<BookingSyncResult> {
  const guestId = await findOrCreateGuestId(
    admin,
    hostId,
    booking.guestEmail,
    booking.guestName
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

  if (updated && updated.length > 0) {
    return { created: false, bookingId: updated[0]?.id ?? null }
  }

  const { data: inserted, error } = await admin
    .from("bookings")
    .insert({
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
    .select("id")
    .single()

  if (error) {
    if (error.code === UNIQUE_VIOLATION)
      return { created: false, bookingId: null }
    throw new Error(error.message)
  }

  return { created: true, bookingId: inserted?.id ?? null }
}

export async function syncBookingRescheduled(
  admin: Admin,
  hostId: string,
  booking: CalBooking
): Promise<BookingUpdateResult> {
  const lookupUid = booking.rescheduleUid ?? booking.uid
  const { data } = await admin
    .from("bookings")
    .update({
      starts_at: booking.startTime,
      ends_at: booking.endTime,
      cal_com_booking_uid: booking.uid,
      updated_at: new Date().toISOString(),
    })
    .eq("host_id", hostId)
    .eq("cal_com_booking_uid", lookupUid)
    .select("id")

  return { bookingId: data?.[0]?.id ?? null }
}

export async function syncBookingCancelled(
  admin: Admin,
  hostId: string,
  uid: string
): Promise<BookingUpdateResult> {
  const { data } = await admin
    .from("bookings")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("host_id", hostId)
    .eq("cal_com_booking_uid", uid)
    .select("id")

  return { bookingId: data?.[0]?.id ?? null }
}

function formatBookingTime(startsAt: string | null): string {
  if (!startsAt) return "an upcoming time"

  const start = new Date(startsAt)
  if (Number.isNaN(start.getTime())) return "an upcoming time"

  return start.toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  })
}

function buildLifecycleEmail(
  booking: CalBooking,
  target: LifecycleEmailTarget,
  event: LifecycleEmailEvent
) {
  const guestLabel = booking.guestName ?? booking.guestEmail ?? "A guest"
  const when = formatBookingTime(booking.startTime)
  const isHost = target === "host"
  const actionLabel = event === "rescheduled" ? "rescheduled" : "cancelled"
  const subjectPrefix =
    event === "rescheduled" ? "Rescheduled booking" : "Cancelled booking"
  const subject = `${subjectPrefix}: ${guestLabel}`

  const body = [
    isHost
      ? `${guestLabel}'s Reunion booking was ${actionLabel}.`
      : `Your Reunion booking was ${actionLabel}.`,
    event === "rescheduled" ? `New time: ${when}` : null,
    booking.guestEmail && isHost ? `Guest email: ${booking.guestEmail}` : null,
    booking.title ? `Topic: ${booking.title}` : null,
    isHost
      ? "View it in your dashboard."
      : "Please contact your host with any questions.",
  ]
    .filter(Boolean)
    .join("\n\n")

  return { subject, body }
}

async function getHostEmail(
  admin: Admin,
  hostId: string
): Promise<string | null> {
  const { data: hostUser } = await admin.auth.admin.getUserById(hostId)
  return hostUser?.user?.email ?? null
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
  episodeId: string | null
): Promise<void> {
  if (!isEmailConfigured()) return

  const hostEmail = await getHostEmail(admin, hostId)
  if (!hostEmail) return

  const guestLabel = booking.guestName ?? booking.guestEmail ?? "A guest"
  const when = formatBookingTime(booking.startTime)
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
    const result = await sendEmail({
      to: hostEmail,
      subject,
      body,
      idempotencyScope: `calcom-booking/${booking.uid}`,
    })
    await logEmailSend(admin, {
      hostId,
      episodeId,
      recipientEmail: hostEmail,
      subject,
      body,
      purpose: "host_booking_notification",
      providerMessageId: result.messageId,
    })
  } catch {
    return
  }
}

export async function notifyHostOfBookingRescheduled(
  admin: Admin,
  hostId: string,
  booking: CalBooking,
  episodeId: string | null
): Promise<void> {
  if (!isEmailConfigured()) return

  const hostEmail = await getHostEmail(admin, hostId)
  if (!hostEmail) return

  const draft = buildLifecycleEmail(booking, "host", "rescheduled")

  try {
    const result = await sendEmail({
      to: hostEmail,
      subject: draft.subject,
      body: draft.body,
      idempotencyScope: `host-booking-rescheduled/${booking.uid}`,
    })
    await logEmailSend(admin, {
      hostId,
      episodeId,
      recipientEmail: hostEmail,
      subject: draft.subject,
      body: draft.body,
      purpose: "host_booking_rescheduled",
      providerMessageId: result.messageId,
    })
  } catch {
    return
  }
}

export async function notifyGuestOfBookingRescheduled(
  admin: Admin,
  hostId: string,
  booking: CalBooking,
  episodeId: string | null
): Promise<void> {
  if (!isEmailConfigured() || !booking.guestEmail) return

  const draft = buildLifecycleEmail(booking, "guest", "rescheduled")

  try {
    const result = await sendEmail({
      to: booking.guestEmail,
      subject: draft.subject,
      body: draft.body,
      idempotencyScope: `guest-booking-rescheduled/${booking.uid}`,
    })
    await logEmailSend(admin, {
      hostId,
      episodeId,
      recipientEmail: booking.guestEmail,
      subject: draft.subject,
      body: draft.body,
      purpose: "guest_booking_rescheduled",
      providerMessageId: result.messageId,
    })
  } catch {
    return
  }
}

export async function notifyHostOfBookingCancelled(
  admin: Admin,
  hostId: string,
  booking: CalBooking,
  episodeId: string | null
): Promise<void> {
  if (!isEmailConfigured()) return

  const hostEmail = await getHostEmail(admin, hostId)
  if (!hostEmail) return

  const draft = buildLifecycleEmail(booking, "host", "cancelled")

  try {
    const result = await sendEmail({
      to: hostEmail,
      subject: draft.subject,
      body: draft.body,
      idempotencyScope: `host-booking-cancelled/${booking.uid}`,
    })
    await logEmailSend(admin, {
      hostId,
      episodeId,
      recipientEmail: hostEmail,
      subject: draft.subject,
      body: draft.body,
      purpose: "host_booking_cancelled",
      providerMessageId: result.messageId,
    })
  } catch {
    return
  }
}

export async function notifyGuestOfBookingCancelled(
  admin: Admin,
  hostId: string,
  booking: CalBooking,
  episodeId: string | null
): Promise<void> {
  if (!isEmailConfigured() || !booking.guestEmail) return

  const draft = buildLifecycleEmail(booking, "guest", "cancelled")

  try {
    const result = await sendEmail({
      to: booking.guestEmail,
      subject: draft.subject,
      body: draft.body,
      idempotencyScope: `guest-booking-cancelled/${booking.uid}`,
    })
    await logEmailSend(admin, {
      hostId,
      episodeId,
      recipientEmail: booking.guestEmail,
      subject: draft.subject,
      body: draft.body,
      purpose: "guest_booking_cancelled",
      providerMessageId: result.messageId,
    })
  } catch {
    return
  }
}

export async function notifyGuestOfBooking(
  admin: Admin,
  hostId: string,
  booking: CalBooking,
  episodeId: string | null
): Promise<void> {
  if (!isEmailConfigured() || !booking.guestEmail) return

  const { data: profile } = await admin
    .from("profiles")
    .select("display_name, show_name")
    .eq("id", hostId)
    .maybeSingle()

  const draft = buildGuestBookingConfirmationEmail({
    guestName: booking.guestName ?? "there",
    hostName: profile?.display_name ?? profile?.show_name ?? null,
    topic: booking.title,
    startsAt: booking.startTime,
    endsAt: booking.endTime,
  })

  try {
    const result = await sendEmail({
      to: booking.guestEmail,
      subject: draft.subject,
      body: draft.body,
      idempotencyScope: `guest-booking-confirmation/${booking.uid}`,
    })
    await logEmailSend(admin, {
      hostId,
      episodeId,
      recipientEmail: booking.guestEmail,
      subject: draft.subject,
      body: draft.body,
      purpose: "guest_booking_confirmation",
      providerMessageId: result.messageId,
    })
  } catch {
    return
  }
}
