"use server"

import { randomBytes } from "node:crypto"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  createWebhook,
  deleteWebhook,
  getEventTypes,
  getProfile,
  verifyApiKey,
} from "@/lib/calcom/api"
import { encryptToken } from "@/lib/crypto/tokens"
import { ensureProfileSlug, normalizeSlug } from "@/lib/host/slug"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

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

export async function updateCalComUrl(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const raw = formData.get("cal_com_booking_url")
  const url =
    typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : null

  const { error } = await supabase
    .from("profiles")
    .update({
      cal_com_booking_url: url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/host/settings")
  revalidatePath("/host/dashboard")
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

export async function disconnectCalCom() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const admin = createAdminClient()

  const { data: creds } = await admin
    .from("host_calcom_credentials")
    .select("selected_event_type_id, webhook_id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (creds?.webhook_id && creds.selected_event_type_id) {
    try {
      await deleteWebhook(user.id, creds.selected_event_type_id, creds.webhook_id)
    } catch {
      // best effort
    }
  }

  await admin
    .from("host_calcom_credentials")
    .delete()
    .eq("user_id", user.id)

  await supabase
    .from("profiles")
    .update({ cal_com_booking_url: null, updated_at: new Date().toISOString() })
    .eq("id", user.id)

  revalidatePath("/host/settings")
  revalidatePath("/host/dashboard")
}

export async function saveCalComApiKey(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const raw = String(formData.get("api_key") ?? "").trim()
  if (raw.length < 8) {
    throw new Error("Paste a valid Cal.com API key.")
  }

  const verified = await verifyApiKey(raw)
  if (!verified) {
    throw new Error(
      "Cal.com rejected that API key. Double-check it in Cal.com → Settings → Developer → API keys.",
    )
  }

  const admin = createAdminClient()

  await admin.from("host_calcom_credentials").upsert(
    {
      user_id: user.id,
      api_key_encrypted: encryptToken(raw),
      calcom_username: verified.username || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  )

  revalidatePath("/host/settings")
  revalidatePath("/host/dashboard")
}

export async function removeCalComApiKey() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const admin = createAdminClient()

  const { data: creds } = await admin
    .from("host_calcom_credentials")
    .select("selected_event_type_id, webhook_id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (creds?.webhook_id && creds.selected_event_type_id) {
    try {
      await deleteWebhook(
        user.id,
        creds.selected_event_type_id,
        creds.webhook_id,
      )
    } catch {
      // best effort while we still have the key
    }
  }

  await admin.from("host_calcom_credentials").delete().eq("user_id", user.id)

  await supabase
    .from("profiles")
    .update({
      cal_com_booking_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  revalidatePath("/host/settings")
  revalidatePath("/host/dashboard")
}

async function resolveSiteOrigin(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")
  if (env) return env
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host")
  const proto = h.get("x-forwarded-proto") ?? "https"
  return host ? `${proto}://${host}` : ""
}

export async function selectEventType(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const eventTypeIdRaw = formData.get("event_type_id")
  const eventTypeId = Number(eventTypeIdRaw)
  if (!Number.isFinite(eventTypeId) || eventTypeId <= 0) {
    throw new Error("Select a valid event type")
  }

  const eventTypes = await getEventTypes(user.id)
  const selected = eventTypes.find((et) => et.id === eventTypeId)
  if (!selected) {
    throw new Error("Event type not found in your Cal.com account")
  }

  const admin = createAdminClient()

  const { data: creds } = await admin
    .from("host_calcom_credentials")
    .select("webhook_id, selected_event_type_id, calcom_username")
    .eq("user_id", user.id)
    .maybeSingle()

  if (creds?.webhook_id && creds.selected_event_type_id) {
    try {
      await deleteWebhook(user.id, creds.selected_event_type_id, creds.webhook_id)
    } catch {
      // best effort cleanup
    }
  }

  let calcomUsername = creds?.calcom_username ?? null
  if (!calcomUsername) {
    try {
      const p = await getProfile(user.id)
      calcomUsername = p?.username ?? null
    } catch {
      // fall through; selected.bookingUrl is the backup
    }
  }

  const slug = await ensureProfileSlug(admin, user.id, {
    calcomUsername,
    email: user.email,
  })

  const origin = await resolveSiteOrigin()
  // Each host's webhook is registered with its own random secret so the
  // handler can verify deliveries against that host alone, never a shared key.
  const webhookSecret = randomBytes(32).toString("hex")
  const subscriberUrl = `${origin}/api/webhooks/calcom?slug=${encodeURIComponent(slug)}`

  const webhookId = await createWebhook(
    user.id,
    eventTypeId,
    subscriberUrl,
    webhookSecret,
  )

  const bookingUrl =
    selected.bookingUrl ??
    (calcomUsername
      ? `https://cal.com/${calcomUsername}/${selected.slug}`
      : null)

  await admin.from("host_calcom_credentials").upsert(
    {
      user_id: user.id,
      selected_event_type_id: eventTypeId,
      selected_event_type_slug: selected.slug,
      webhook_id: webhookId,
      webhook_secret_encrypted: webhookId ? encryptToken(webhookSecret) : null,
      calcom_username: calcomUsername,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  )

  if (bookingUrl) {
    await supabase
      .from("profiles")
      .update({
        cal_com_booking_url: bookingUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
  }

  revalidatePath("/host/settings")
  revalidatePath("/host/dashboard")
}
