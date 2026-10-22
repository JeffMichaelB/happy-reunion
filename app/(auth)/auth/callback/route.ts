import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import { authDestinationForType } from "@/lib/auth/destinations"

/**
 * Validate and sanitize redirect path to prevent open redirect attacks.
 * Only allows same-origin relative paths starting with "/".
 */
function sanitizeRedirectPath(path: string | null, fallback: string): string {
  if (!path) return fallback
  const trimmed = path.trim()
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("://")
  ) {
    return fallback
  }
  return trimmed
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const type = url.searchParams.get("type")
  const fallbackDest = authDestinationForType(type)
  const next = sanitizeRedirectPath(url.searchParams.get("next"), fallbackDest)
  const origin = url.origin

  const response = NextResponse.redirect(`${origin}${next}`)

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  return response
}
