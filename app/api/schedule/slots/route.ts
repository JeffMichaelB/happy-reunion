import { NextResponse, type NextRequest } from "next/server"

import { getCalendarClient } from "@/lib/google/client"
import { computeAvailableSlots, type TimeSlot } from "@/lib/scheduling/slots"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get("slug")
  const rangeStartParam = searchParams.get("rangeStart")
  const rangeEndParam = searchParams.get("rangeEnd")

  if (!slug || !rangeStartParam || !rangeEndParam) {
    return NextResponse.json(
      { error: "slug, rangeStart, and rangeEnd query params required" },
      { status: 400 },
    )
  }

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from("profiles")
    .select("id, default_calendar_id")
    .eq("slug", slug)
    .single()

  if (!profile) {
    return NextResponse.json({ error: "Host not found" }, { status: 404 })
  }

  const hostId = profile.id

  const [windowsRes, defaultsRes, episodesRes] = await Promise.all([
    admin.from("availability_windows").select("day_of_week, start_time, end_time").eq("host_id", hostId),
    admin.from("host_scheduling_defaults").select("*").eq("host_id", hostId).single(),
    admin
      .from("bookings")
      .select("starts_at, ends_at")
      .eq("host_id", hostId)
      .in("status", ["confirmed", "pending_guest"])
      .not("starts_at", "is", null)
      .not("ends_at", "is", null),
  ])

  if (!defaultsRes.data) {
    return NextResponse.json(
      { error: "Host has not configured scheduling defaults" },
      { status: 404 },
    )
  }

  const rangeStart = new Date(rangeStartParam)
  const rangeEnd = new Date(rangeEndParam)

  let busyBlocks: TimeSlot[] = []
  try {
    const calendar = await getCalendarClient(hostId)
    const calendarId = profile.default_calendar_id || "primary"
    const res = await calendar.events.list({
      calendarId,
      timeMin: rangeStart.toISOString(),
      timeMax: rangeEnd.toISOString(),
      singleEvents: true,
      maxResults: 250,
    })

    busyBlocks = (res.data.items ?? [])
      .filter((e) => e.start?.dateTime && e.end?.dateTime && e.status !== "cancelled")
      .map((e) => ({
        start: new Date(e.start!.dateTime!),
        end: new Date(e.end!.dateTime!),
      }))
  } catch {
    // If Google Calendar is not connected, proceed without busy blocks
  }

  const existingEpisodes: TimeSlot[] = (episodesRes.data ?? [])
    .filter((e) => e.starts_at && e.ends_at)
    .map((e) => ({
      start: new Date(e.starts_at!),
      end: new Date(e.ends_at!),
    }))

  const slots = computeAvailableSlots({
    rangeStart,
    rangeEnd,
    windows: windowsRes.data ?? [],
    defaults: defaultsRes.data,
    busyBlocks,
    existingEpisodes,
  })

  return NextResponse.json({
    slots: slots.map((s) => ({
      start: s.start.toISOString(),
      end: s.end.toISOString(),
    })),
  })
}
