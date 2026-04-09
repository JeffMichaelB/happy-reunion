import { NextResponse, type NextRequest } from "next/server"

import { getCalendarClient } from "@/lib/google/client"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Guest confirm/decline endpoint for host-initiated invitations.
 * The link in the email includes a JWT or signed token with episodeId + action.
 * For Phase 1, we use a simple query-param approach (episodeId + action + email).
 * A proper JWT implementation can be added for production hardening.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const episodeId = searchParams.get("episodeId")
  const action = searchParams.get("action") as "confirm" | "decline" | null
  const email = searchParams.get("email")

  if (!episodeId || !action || !email) {
    return NextResponse.json(
      { error: "episodeId, action, and email are required" },
      { status: 400 },
    )
  }

  const admin = createAdminClient()

  const { data: episode } = await admin
    .from("bookings")
    .select("id, host_id, guest_email, status, google_event_id")
    .eq("id", episodeId)
    .single()

  if (!episode) {
    return NextResponse.json({ error: "Episode not found" }, { status: 404 })
  }

  if (episode.guest_email.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  if (episode.status !== "pending_guest") {
    return NextResponse.json({
      message: `Episode is already ${episode.status}`,
    })
  }

  if (action === "confirm") {
    await admin
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", episodeId)

    return NextResponse.json({ ok: true, message: "Episode confirmed!" })
  }

  if (action === "decline") {
    await admin
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", episodeId)

    if (episode.google_event_id) {
      try {
        const calendar = await getCalendarClient(episode.host_id)
        const { data: profile } = await admin
          .from("profiles")
          .select("default_calendar_id")
          .eq("id", episode.host_id)
          .single()
        const calendarId = profile?.default_calendar_id || "primary"
        await calendar.events.delete({
          calendarId,
          eventId: episode.google_event_id,
        })
      } catch {
        // Calendar cleanup failure is non-blocking
      }
    }

    return NextResponse.json({ ok: true, message: "Episode declined." })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
