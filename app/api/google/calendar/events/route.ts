import { NextResponse, type NextRequest } from "next/server"

import { getCalendarClient } from "@/lib/google/client"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const timeMin = searchParams.get("timeMin")
  const timeMax = searchParams.get("timeMax")

  if (!timeMin || !timeMax) {
    return NextResponse.json(
      { error: "timeMin and timeMax query params required" },
      { status: 400 },
    )
  }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from("profiles")
    .select("default_calendar_id")
    .eq("id", user.id)
    .single()

  const calendarId = profile?.default_calendar_id || "primary"

  try {
    const calendar = await getCalendarClient(user.id)
    const res = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 250,
    })

    const events = (res.data.items ?? []).map((e) => ({
      id: e.id,
      summary: e.summary,
      start: e.start?.dateTime ?? e.start?.date,
      end: e.end?.dateTime ?? e.end?.date,
      status: e.status,
    }))

    return NextResponse.json({ events })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Google Calendar error"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
