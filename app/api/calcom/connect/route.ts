import { randomBytes } from "node:crypto"

import { NextResponse } from "next/server"
import { cookies } from "next/headers"

import { buildAuthorizeUrl } from "@/lib/calcom/oauth"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const origin = new URL(request.url).origin
  const redirectUri = `${origin}/api/calcom/callback`

  const state = randomBytes(16).toString("hex")

  const cookieStore = await cookies()
  cookieStore.set("calcom_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  })

  const authorizeUrl = buildAuthorizeUrl(redirectUri, state)
  return NextResponse.redirect(authorizeUrl)
}
