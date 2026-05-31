"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { cancelBooking, rescheduleBooking } from "@/lib/calcom/api"
import { EmailNotConfiguredError, sendEmail } from "@/lib/email/resend"
import { findOrCreateGuestId } from "@/lib/guests/link"
import type { Enums } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/server"

type BookingStatus = Enums<"booking_status">

function parseOptionalUuid(value: FormDataEntryValue | null): string | null {
  const s = typeof value === "string" ? value.trim() : ""
  return s.length > 0 ? s : null
}

function parseOptionalString(value: FormDataEntryValue | null): string | null {
  const s = typeof value === "string" ? value.trim() : ""
  return s.length > 0 ? s : null
}

function parseOptionalIsoDatetime(value: FormDataEntryValue | null): string | null {
  const s = typeof value === "string" ? value.trim() : ""
  if (!s) return null
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

function isBookingStatus(s: string): s is BookingStatus {
  return (
    s === "draft" ||
    s === "pending_guest" ||
    s === "confirmed" ||
    s === "recorded" ||
    s === "published" ||
    s === "cancelled" ||
    s === "completed"
  )
}

export async function createEpisode(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const guest_email = (formData.get("guest_email") as string)?.trim()
  if (!guest_email) {
    redirect("/host/episodes?error=missing_email")
  }

  const guest_name = parseOptionalString(formData.get("guest_name"))
  if (!guest_name) {
    redirect("/host/episodes?error=missing_guest_name")
  }
  const providedGuestId = parseOptionalUuid(formData.get("guest_id"))
  const guest_id =
    providedGuestId ??
    (await findOrCreateGuestId(supabase, user.id, guest_email, guest_name))
  const starts_at = parseOptionalIsoDatetime(formData.get("starts_at"))
  const ends_at = parseOptionalIsoDatetime(formData.get("ends_at"))
  const topic = parseOptionalString(formData.get("topic"))
  const notes = parseOptionalString(formData.get("notes"))

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      host_id: user.id,
      guest_email,
      guest_name,
      guest_id,
      starts_at,
      ends_at,
      topic,
      notes,
      status: "draft",
    })
    .select("id")
    .single()

  if (error || !data) {
    redirect("/host/episodes?error=create_failed")
  }

  revalidatePath("/host/episodes")
  redirect(`/host/episodes/${data.id}`)
}

export async function updateEpisode(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const id = (formData.get("id") as string)?.trim()
  if (!id) redirect("/host/episodes")

  if (formData.get("partial") === "riverside") {
    const riverside_url = parseOptionalString(formData.get("riverside_url"))
    const { error } = await supabase
      .from("bookings")
      .update({ riverside_url })
      .eq("id", id)
      .eq("host_id", user.id)
    if (error) redirect(`/host/episodes/${id}?error=riverside_failed`)
    revalidatePath("/host/episodes")
    revalidatePath(`/host/episodes/${id}`)
    redirect(`/host/episodes/${id}`)
  }

  const guest_email = (formData.get("guest_email") as string)?.trim()
  if (!guest_email) {
    redirect(`/host/episodes/${id}?error=missing_email`)
  }

  const guest_name = parseOptionalString(formData.get("guest_name"))
  const starts_at = parseOptionalIsoDatetime(formData.get("starts_at"))
  const ends_at = parseOptionalIsoDatetime(formData.get("ends_at"))
  const topic = parseOptionalString(formData.get("topic"))
  const notes = parseOptionalString(formData.get("notes"))
  const riverside_url = parseOptionalString(formData.get("riverside_url"))

  const statusRaw = (formData.get("status") as string)?.trim()
  const status: BookingStatus | undefined =
    statusRaw && isBookingStatus(statusRaw) ? statusRaw : undefined

  const patch: Record<string, unknown> = {
    guest_email,
    guest_name,
    starts_at,
    ends_at,
    topic,
    notes,
    riverside_url,
  }
  if (status !== undefined) patch.status = status

  const { error } = await supabase
    .from("bookings")
    .update(patch)
    .eq("id", id)
    .eq("host_id", user.id)

  if (error) {
    redirect(`/host/episodes/${id}?error=update_failed`)
  }

  revalidatePath("/host/episodes")
  revalidatePath(`/host/episodes/${id}`)
  redirect(`/host/episodes/${id}`)
}

export async function deleteEpisode(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const id = (formData.get("id") as string)?.trim()
  if (!id) redirect("/host/episodes")

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", id)
    .eq("host_id", user.id)

  if (error) {
    redirect(`/host/episodes/${id}?error=delete_failed`)
  }

  revalidatePath("/host/episodes")
  redirect("/host/episodes")
}

export async function updateEpisodeStatus(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const id = (formData.get("id") as string)?.trim()
  const statusRaw = (formData.get("status") as string)?.trim()
  if (!id || !statusRaw || !isBookingStatus(statusRaw)) {
    if (id) redirect(`/host/episodes/${id}?error=invalid_status`)
    redirect("/host/episodes")
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status: statusRaw })
    .eq("id", id)
    .eq("host_id", user.id)

  if (error) {
    redirect(`/host/episodes/${id}?error=status_failed`)
  }

  revalidatePath("/host/episodes")
  revalidatePath(`/host/episodes/${id}`)
  redirect(`/host/episodes/${id}`)
}

export async function sendEpisodeEmail(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const id = (formData.get("id") as string)?.trim()
  if (!id) redirect("/host/episodes")

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, guest_email")
    .eq("id", id)
    .eq("host_id", user.id)
    .single()

  if (!booking) {
    redirect("/host/episodes")
  }

  const to = parseOptionalString(formData.get("to")) ?? booking.guest_email
  const subject = parseOptionalString(formData.get("subject"))
  const body = parseOptionalString(formData.get("body"))

  if (!to) {
    redirect(`/host/episodes/${id}?error=missing_recipient`)
  }
  if (!subject) {
    redirect(`/host/episodes/${id}?error=missing_subject`)
  }
  if (!body) {
    redirect(`/host/episodes/${id}?error=missing_body`)
  }

  let messageId: string | null = null
  try {
    const result = await sendEmail({
      to,
      subject,
      body,
      idempotencyScope: id,
    })
    messageId = result.messageId
  } catch (err) {
    if (err instanceof EmailNotConfiguredError) {
      redirect(`/host/episodes/${id}?error=email_not_configured`)
    }
    redirect(`/host/episodes/${id}?error=email_failed`)
  }

  const { error: logError } = await supabase.from("email_sends").insert({
    host_id: user.id,
    episode_id: id,
    recipient_email: to,
    subject,
    gmail_message_id: messageId,
  })

  if (logError) {
    redirect(`/host/episodes/${id}?error=email_log_failed`)
  }

  revalidatePath("/host/episodes")
  revalidatePath(`/host/episodes/${id}`)
  revalidatePath("/host/dashboard")
  redirect(`/host/episodes/${id}?sent=1`)
}

export async function cancelEpisodeViaCal(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const id = (formData.get("id") as string)?.trim()
  if (!id) redirect("/host/episodes")

  const { data: booking } = await supabase
    .from("bookings")
    .select("cal_com_booking_uid")
    .eq("id", id)
    .eq("host_id", user.id)
    .single()

  if (!booking?.cal_com_booking_uid) {
    redirect(`/host/episodes/${id}?error=no_calcom_uid`)
  }

  const reason = (formData.get("reason") as string)?.trim() || "Cancelled by host"

  const ok = await cancelBooking(user.id, booking.cal_com_booking_uid, reason)
  if (!ok) {
    redirect(`/host/episodes/${id}?error=cancel_failed`)
  }

  await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("host_id", user.id)

  revalidatePath("/host/episodes")
  revalidatePath(`/host/episodes/${id}`)
  redirect(`/host/episodes/${id}`)
}

export async function rescheduleEpisodeViaCal(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const id = (formData.get("id") as string)?.trim()
  if (!id) redirect("/host/episodes")

  const newStart = (formData.get("new_start") as string)?.trim()
  if (!newStart) {
    redirect(`/host/episodes/${id}?error=missing_datetime`)
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select("cal_com_booking_uid")
    .eq("id", id)
    .eq("host_id", user.id)
    .single()

  if (!booking?.cal_com_booking_uid) {
    redirect(`/host/episodes/${id}?error=no_calcom_uid`)
  }

  const reason = (formData.get("reason") as string)?.trim() || "Rescheduled by host"
  const startIso = new Date(newStart).toISOString()

  const ok = await rescheduleBooking(
    user.id,
    booking.cal_com_booking_uid,
    startIso,
    reason,
  )
  if (!ok) {
    redirect(`/host/episodes/${id}?error=reschedule_failed`)
  }

  await supabase
    .from("bookings")
    .update({ starts_at: startIso })
    .eq("id", id)
    .eq("host_id", user.id)

  revalidatePath("/host/episodes")
  revalidatePath(`/host/episodes/${id}`)
  redirect(`/host/episodes/${id}`)
}
