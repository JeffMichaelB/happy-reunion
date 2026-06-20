import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/database.types"

type Admin = SupabaseClient<Database>

export function normalizeSlug(raw: string): string | null {
  const s = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
  return s.length > 0 ? s : null
}

function slugFromEmail(email: string | null | undefined): string | null {
  if (!email) return null
  const local = email.split("@")[0] ?? ""
  return normalizeSlug(local)
}

async function isSlugAvailable(
  admin: Admin,
  slug: string,
  userId: string,
): Promise<boolean> {
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("slug", slug)
    .maybeSingle()

  return !data || data.id === userId
}

async function pickUniqueSlug(
  admin: Admin,
  base: string,
  userId: string,
): Promise<string> {
  if (await isSlugAvailable(admin, base, userId)) return base

  for (let i = 2; i < 100; i++) {
    const candidate = `${base}-${i}`
    if (await isSlugAvailable(admin, candidate, userId)) return candidate
  }

  return `${base}-${userId.slice(0, 8)}`
}

/**
 * Ensures the host has a stable profiles.slug for webhook routing (?slug=).
 * Uses the existing slug when set; otherwise derives from Cal.com username or
 * email and persists it before webhook registration.
 */
export async function ensureProfileSlug(
  admin: Admin,
  userId: string,
  hints: { calcomUsername?: string | null; email?: string | null },
): Promise<string> {
  const { data: profile } = await admin
    .from("profiles")
    .select("slug")
    .eq("id", userId)
    .single()

  if (profile?.slug) return profile.slug

  const base =
    normalizeSlug(hints.calcomUsername ?? "") ??
    slugFromEmail(hints.email) ??
    userId.slice(0, 8)

  const slug = await pickUniqueSlug(admin, base, userId)

  const { error } = await admin
    .from("profiles")
    .update({ slug, updated_at: new Date().toISOString() })
    .eq("id", userId)

  if (error) {
    throw new Error(error.message)
  }

  return slug
}
