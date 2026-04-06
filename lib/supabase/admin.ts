import { createClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/database.types"

/**
 * Service role client — bypasses RLS. Use only in Route Handlers / Server Actions
 * after you have verified the end-user identity with the anon-key server client.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  }
  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
