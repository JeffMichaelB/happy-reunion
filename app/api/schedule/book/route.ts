import { NextResponse, type NextRequest } from "next/server"

import { getCalendarClient, getGmailClient } from "@/lib/google/client"
import { createAdminClient } from "@/lib/supabase/admin"

interface BookingPayload {
  slug: string
  name: string
  email: string
  topic?: string
  notes?: string
  slotStart: string
  slotEnd: string
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as BookingPayload
  const { slug, name, email, topic, notes, slotStart, slotEnd } = payload

  if (!slug || !name || !email || !slotStart || !slotEnd) {
    return NextResponse.json(
      { error: "slug, name, email, slotStart, and slotEnd are required" },
      { status: 400 },
    )
  }

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from("profiles")
    .select("id, display_name, show_name, default_calendar_id, workspace_email")
    .eq("slug", slug)
    .single()

  if (!profile) {
    return NextResponse.json({ error: "Host not found" }, { status: 404 })
  }

  const hostId = profile.id

  const { data: guest } = await admin
    .from("guests")
    .upsert(
      { host_id: hostId, email, name },
      { onConflict: "host_id,email" },
    )
    .select("id")
    .single()

  if (!guest) {
    return NextResponse.json({ error: "Failed to create guest" }, { status: 500 })
  }

  const { data: episode, error: episodeError } = await admin
    .from("bookings")
    .insert({
      host_id: hostId,
      guest_id: guest.id,
      guest_email: email,
      guest_name: name,
      topic: topic || null,
      notes: notes || null,
      starts_at: slotStart,
      ends_at: slotEnd,
      status: "confirmed",
    })
    .select("id")
    .single()

  if (episodeError || !episode) {
    return NextResponse.json(
      { error: episodeError?.message ?? "Failed to create episode" },
      { status: 500 },
    )
  }

  const calendarId = profile.default_calendar_id || "primary"
  const showName = profile.show_name ?? profile.display_name ?? "Podcast Recording"

  try {
    const calendar = await getCalendarClient(hostId)
    const calEvent = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `${showName}: ${topic ?? "Recording"}`,
        description: notes ?? undefined,
        start: { dateTime: slotStart },
        end: { dateTime: slotEnd },
        attendees: [{ email, displayName: name }],
      },
      sendUpdates: "all",
    })

    if (calEvent.data.id) {
      await admin
        .from("bookings")
        .update({ google_event_id: calEvent.data.id })
        .eq("id", episode.id)
    }
  } catch {
    // Calendar sync failure is non-blocking
  }

  try {
    const gmail = await getGmailClient(hostId)
    const gmailProfile = await gmail.users.getProfile({ userId: "me" })
    const fromEmail = gmailProfile.data.emailAddress ?? profile.workspace_email ?? ""

    const startDate = new Date(slotStart)
    const dateStr = startDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    const timeStr = startDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })

    const confirmationBody = [
      `Hi ${name},`,
      "",
      `You're confirmed for ${showName} on ${dateStr} at ${timeStr}.`,
      topic ? `\nTopic: ${topic}` : "",
      "",
      `Looking forward to it!`,
      `${profile.display_name ?? "Your host"}`,
    ]
      .filter(Boolean)
      .join("\n")

    const raw = buildRfc2822({
      from: fromEmail,
      to: email,
      subject: `You're confirmed for ${showName}`,
      body: confirmationBody,
    })

    const sent = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    })

    await admin.from("email_sends").insert({
      host_id: hostId,
      recipient_email: email,
      subject: `You're confirmed for ${showName}`,
      gmail_message_id: sent.data.id ?? null,
      episode_id: episode.id,
    })
  } catch {
    // Email failure is non-blocking
  }

  return NextResponse.json({ ok: true, episodeId: episode.id })
}

function buildRfc2822(params: {
  from: string
  to: string
  subject: string
  body: string
}): string {
  const lines = [
    `From: ${params.from}`,
    `To: ${params.to}`,
    `Subject: ${params.subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    params.body,
  ]
  return Buffer.from(lines.join("\r\n")).toString("base64url")
}
