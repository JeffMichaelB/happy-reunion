"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

function parsePositiveInt(
  value: FormDataEntryValue | null,
  fallback: number,
): number {
  if (value == null || typeof value !== "string") return fallback
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) && n >= 0 ? n : fallback
}

export async function upsertSchedulingDefaults(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const timezone = String(formData.get("timezone") ?? "").trim() || "UTC"

  const row = {
    host_id: user.id,
    slot_duration_minutes: parsePositiveInt(
      formData.get("slot_duration_minutes"),
      30,
    ),
    buffer_before_minutes: parsePositiveInt(
      formData.get("buffer_before_minutes"),
      0,
    ),
    buffer_after_minutes: parsePositiveInt(
      formData.get("buffer_after_minutes"),
      0,
    ),
    min_notice_hours: parsePositiveInt(formData.get("min_notice_hours"), 24),
    timezone,
  }

  const { error } = await supabase
    .from("host_scheduling_defaults")
    .upsert(row, { onConflict: "host_id" })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/host/calendar")
  redirect("/host/calendar")
}

export async function createAvailabilityWindow(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const dayRaw = String(formData.get("day_of_week") ?? "")
  const day_of_week = Number.parseInt(dayRaw, 10)
  if (!Number.isFinite(day_of_week) || day_of_week < 0 || day_of_week > 6) {
    redirect("/host/calendar?error=day")
  }

  const start_time = String(formData.get("start_time") ?? "").trim()
  const end_time = String(formData.get("end_time") ?? "").trim()
  if (!start_time || !end_time) {
    redirect("/host/calendar?error=time")
  }

  const { error } = await supabase.from("availability_windows").insert({
    host_id: user.id,
    day_of_week,
    start_time,
    end_time,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/host/calendar")
  redirect("/host/calendar")
}

export async function deleteAvailabilityWindow(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const id = String(formData.get("id") ?? "").trim()
  if (!id) redirect("/host/calendar")

  const { error } = await supabase
    .from("availability_windows")
    .delete()
    .eq("id", id)
    .eq("host_id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/host/calendar")
  redirect("/host/calendar")
}
