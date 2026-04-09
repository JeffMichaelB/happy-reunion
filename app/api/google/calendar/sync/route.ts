import { NextResponse, type NextRequest } from "next/server"

import { getCalendarClient } from "@/lib/google/client"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { episodeId, action } = body as {
    episodeId: string
    action: "create" | "update" | "delete"
  }

  if (!episodeId || !action) {
    return NextResponse.json({ error: "episodeId and action required" }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from("profiles")
    .select("default_calendar_id, show_name, display_name")
    .eq("id", user.id)
    .single()

  const calendarId = profile?.default_calendar_id || "primary"

  const { data: episode } = await admin
    .from("bookings")
    .select("*, guests(name, email)")
    .eq("id", episodeId)
    .eq("host_id", user.id)
    .single()

  if (!episode) {
    return NextResponse.json({ error: "Episode not found" }, { status: 404 })
  }

  try {
    const calendar = await getCalendarClient(user.id)

    if (action === "delete") {
      if (episode.google_event_id) {
        await calendar.events.delete({
          calendarId,
          eventId: episode.google_event_id,
        })
        await admin
          .from("bookings")
          .update({ google_event_id: null })
          .eq("id", episodeId)
      }
      return NextResponse.json({ ok: true })
    }

    const guestName =
      (episode.guests as { name: string; email: string } | null)?.name ?? episode.guest_name
    const guestEmail =
      (episode.guests as { name: string; email: string } | null)?.email ?? episode.guest_email

    const showName = profile?.show_name ?? profile?.display_name ?? "Podcast Recording"

    const eventBody = {
      summary: `${showName}: ${episode.topic ?? "Recording"}`,
      description: episode.notes ?? undefined,
      start: episode.starts_at
        ? { dateTime: episode.starts_at }
        : undefined,
      end: episode.ends_at
        ? { dateTime: episode.ends_at }
        : undefined,
      attendees: guestEmail ? [{ email: guestEmail, displayName: guestName ?? undefined }] : [],
    }

    if (action === "create" || !episode.google_event_id) {
      const res = await calendar.events.insert({
        calendarId,
        requestBody: eventBody,
        sendUpdates: "all",
      })

      await admin
        .from("bookings")
        .update({ google_event_id: res.data.id })
        .eq("id", episodeId)

      return NextResponse.json({ ok: true, eventId: res.data.id })
    }

    await calendar.events.patch({
      calendarId,
      eventId: episode.google_event_id,
      requestBody: eventBody,
      sendUpdates: "all",
    })

    return NextResponse.json({ ok: true, eventId: episode.google_event_id })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Google Calendar error"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
