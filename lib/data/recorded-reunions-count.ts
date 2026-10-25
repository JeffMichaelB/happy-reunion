import "server-only"

import { unstable_cache } from "next/cache"

import { createAdminClient } from "@/lib/supabase/admin"

// Force rebuild: env var now available for preview

/**
 * Fetches the count of reunions with status 'recorded' from the bookings table.
 *
 * Why `bookings` table with `status = 'recorded'`:
 * - The `bookings` table represents reunion sessions (each booking is a scheduled reunion)
 * - The `status` column uses the `booking_status` enum which includes 'recorded'
 * - A booking transitions to 'recorded' status after the reunion has been captured
 *
 * Server-only: Uses service role key to bypass RLS (read-only count aggregate).
 * Cached: Revalidates every 3600 seconds (1 hour).
 */
async function fetchRecordedReunionsCount(): Promise<number | null> {
  try {
    const supabase = createAdminClient()

    const { count, error } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "recorded")

    if (error) {
      console.error("[recorded-reunions-count] Supabase query error:", error.message)
      return null
    }

    return count
  } catch (err) {
    console.error(
      "[recorded-reunions-count] Unexpected error:",
      err instanceof Error ? err.message : err
    )
    return null
  }
}

/**
 * Cached version of the recorded reunions count.
 * Revalidates every 3600 seconds (1 hour).
 * Returns null on any error (caller should show fallback UI).
 */
export const getRecordedReunionsCount = unstable_cache(
  fetchRecordedReunionsCount,
  ["recorded-reunions-count"],
  { revalidate: 3600 }
)
