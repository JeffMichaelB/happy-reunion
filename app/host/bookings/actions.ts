"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  optionalText,
  parseBookingStatus,
  parseOptionalTimestamptz,
} from "@/lib/host-form"
import { createClient } from "@/lib/supabase/server"

export async function createBooking(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const guest_email = String(formData.get("guest_email") ?? "").trim()
  if (!guest_email) {
    redirect("/host/bookings/new?error=missing_email")
  }

  const { error } = await supabase.from("bookings").insert({
    host_id: user.id,
    guest_email,
    guest_name: optionalText(formData.get("guest_name")),
    starts_at: parseOptionalTimestamptz(formData.get("starts_at")),
    ends_at: parseOptionalTimestamptz(formData.get("ends_at")),
    status: parseBookingStatus(formData.get("status")),
    notes: optionalText(formData.get("notes")),
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/host/bookings")
  redirect("/host/bookings")
}

export async function updateBooking(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const id = String(formData.get("id") ?? "").trim()
  if (!id) redirect("/host/bookings")

  const guest_email = String(formData.get("guest_email") ?? "").trim()
  if (!guest_email) {
    redirect(`/host/bookings/${id}?error=missing_email`)
  }

  const { error } = await supabase
    .from("bookings")
    .update({
      guest_email,
      guest_name: optionalText(formData.get("guest_name")),
      starts_at: parseOptionalTimestamptz(formData.get("starts_at")),
      ends_at: parseOptionalTimestamptz(formData.get("ends_at")),
      status: parseBookingStatus(formData.get("status")),
      notes: optionalText(formData.get("notes")),
    })
    .eq("id", id)
    .eq("host_id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/host/bookings")
  revalidatePath(`/host/bookings/${id}`)
  redirect("/host/bookings")
}

export async function deleteBooking(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const id = String(formData.get("id") ?? "").trim()
  if (!id) redirect("/host/bookings")

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", id)
    .eq("host_id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/host/bookings")
  redirect("/host/bookings")
}
