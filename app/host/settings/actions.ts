"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

function normalizeSlug(raw: string): string | null {
  const s = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
  return s.length > 0 ? s : null
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const updates: {
    display_name?: string | null
    show_name?: string | null
    show_description?: string | null
    slug?: string | null
    updated_at: string
  } = { updated_at: new Date().toISOString() }

  if (formData.has("display_name")) {
    updates.display_name =
      String(formData.get("display_name") ?? "").trim() || null
  }
  if (formData.has("show_name")) {
    updates.show_name = String(formData.get("show_name") ?? "").trim() || null
  }
  if (formData.has("show_description")) {
    updates.show_description =
      String(formData.get("show_description") ?? "").trim() || null
  }
  if (formData.has("slug")) {
    updates.slug = normalizeSlug(String(formData.get("slug") ?? ""))
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/host/settings")
}

export async function updateDefaultCalendar(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const raw = formData.get("default_calendar_id")
  const id =
    typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : null

  const { error } = await supabase
    .from("profiles")
    .update({
      default_calendar_id: id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/host/settings")
}

const AVATAR_MAX_BYTES = 5 * 1024 * 1024

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const file = formData.get("avatar")
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose an image file to upload.")
  }

  if (file.size > AVATAR_MAX_BYTES) {
    throw new Error("Image must be 5MB or smaller.")
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed.")
  }

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase()
  const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "jpg"
  const path = `${user.id}/avatar.${safeExt}`

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      avatar_url: path,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (updateError) {
    throw new Error(updateError.message)
  }

  revalidatePath("/host/settings")
}

export async function disconnectGoogle(formData: FormData) {
  void formData
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const admin = createAdminClient()
  const { error } = await admin
    .from("host_google_credentials")
    .delete()
    .eq("user_id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/host/settings")
}

export async function deleteAccount(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const confirm = String(formData.get("confirm_delete") ?? "")
  if (confirm !== "DELETE") {
    throw new Error('Type DELETE in the confirmation field to remove your account.')
  }

  const userId = user.id
  const admin = createAdminClient()

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
  if (deleteError) {
    throw new Error(deleteError.message)
  }

  await supabase.auth.signOut()

  redirect("/login")
}
