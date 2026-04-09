import { NextResponse } from "next/server"

import { getCalendarClient } from "@/lib/google/client"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const calendar = await getCalendarClient(user.id)
    const res = await calendar.calendarList.list({ minAccessRole: "owner" })

    const calendars = (res.data.items ?? []).map((c) => ({
      id: c.id,
      summary: c.summary,
      primary: c.primary ?? false,
    }))

    return NextResponse.json({ calendars })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Google Calendar error"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
