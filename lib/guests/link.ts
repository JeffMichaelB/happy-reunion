import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/database.types"

/**
 * Resolves a guest record for a host by email, creating one if it doesn't yet
 * exist, and returns its id so a booking can be linked into the CRM.
 *
 * Emails are normalized to lowercase so the same person isn't duplicated when
 * Cal.com and the host enter different casing. Returns null when no usable
 * email is available (the booking still keeps its plain-text guest fields).
 */
export async function findOrCreateGuestId(
  client: SupabaseClient<Database>,
  hostId: string,
  email: string | null | undefined,
  name: string | null | undefined,
): Promise<string | null> {
  const normalizedEmail = email?.trim().toLowerCase()
  if (!normalizedEmail) return null

  const { data: existing } = await client
    .from("guests")
    .select("id")
    .eq("host_id", hostId)
    .eq("email", normalizedEmail)
    .maybeSingle()

  if (existing) return existing.id

  const { data: created, error } = await client
    .from("guests")
    .insert({
      host_id: hostId,
      email: normalizedEmail,
      name: name?.trim() || normalizedEmail,
    })
    .select("id")
    .single()

  if (!error && created) return created.id

  // A concurrent booking may have created the row first; re-read once.
  const { data: retry } = await client
    .from("guests")
    .select("id")
    .eq("host_id", hostId)
    .eq("email", normalizedEmail)
    .maybeSingle()

  return retry?.id ?? null
}
