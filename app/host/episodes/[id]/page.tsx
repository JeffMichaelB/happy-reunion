import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import {
  deleteEpisode,
  syncEpisodeCalendar,
  updateEpisode,
  updateEpisodeStatus,
} from "@/app/host/episodes/actions"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Enums } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

import { EpisodeStatusForm } from "./episode-status-form"

type BookingStatus = Enums<"booking_status">

type EpisodeDetail = {
  id: string
  host_id: string
  guest_id: string | null
  guest_email: string
  guest_name: string | null
  starts_at: string | null
  ends_at: string | null
  topic: string | null
  notes: string | null
  status: BookingStatus
  riverside_url: string | null
  google_event_id: string | null
  created_at: string
  updated_at: string
  guests: { id: string; name: string; email: string } | null
}

function statusBadgeClass(status: BookingStatus): string {
  const base =
    "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium"
  switch (status) {
    case "draft":
    case "completed":
      return cn(
        base,
        "bg-[#f3f4f6] text-[#374151] border-[#d1d5db]",
      )
    case "pending_guest":
      return cn(
        base,
        "bg-[#fef3c7] text-[#92400e] border-[#fcd34d]",
      )
    case "confirmed":
      return cn(
        base,
        "bg-[#dcfce7] text-[#166534] border-[#86efac]",
      )
    case "recorded":
      return cn(
        base,
        "bg-[#dbeafe] text-[#1e40af] border-[#93c5fd]",
      )
    case "published":
      return cn(
        base,
        "bg-[#f3e8ff] text-[#6b21a8] border-[#c4b5fd]",
      )
    case "cancelled":
      return cn(
        base,
        "bg-[#fee2e2] text-[#991b1b] border-[#fca5a5]",
      )
  }
}

function formatStatusLabel(status: BookingStatus): string {
  switch (status) {
    case "pending_guest":
      return "Pending guest"
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

function formatRange(starts: string | null, ends: string | null): string {
  if (!starts) return "—"
  const s = new Date(starts)
  if (Number.isNaN(s.getTime())) return "—"
  const startStr = s.toLocaleString(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  })
  if (!ends) return startStr
  const e = new Date(ends)
  if (Number.isNaN(e.getTime())) return startStr
  const endStr = e.toLocaleTimeString(undefined, { timeStyle: "short" })
  return `${startStr} – ${endStr}`
}

function gmailComposeUrl(to: string, subject: string, body: string): string {
  const p = new URLSearchParams({
    view: "cm",
    fs: "1",
    to,
    su: subject,
    body,
  })
  return `https://mail.google.com/mail/?${p.toString()}`
}

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; calendar?: string }>
}

export default async function EpisodeDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const q = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: raw } = await supabase
    .from("bookings")
    .select(
      "id, host_id, guest_id, guest_email, guest_name, starts_at, ends_at, topic, notes, status, riverside_url, google_event_id, created_at, updated_at, guests ( id, name, email )",
    )
    .eq("id", id)
    .eq("host_id", user.id)
    .single()

  if (!raw) notFound()

  const episode = raw as EpisodeDetail

  const { data: emailRows } = await supabase
    .from("email_sends")
    .select("id, recipient_email, subject, sent_at, gmail_message_id")
    .eq("host_id", user.id)
    .eq("episode_id", id)
    .order("sent_at", { ascending: false })

  const { data: profile } = await supabase
    .from("profiles")
    .select("slug")
    .eq("id", user.id)
    .single()

  const guestDisplayName = episode.guests?.name ?? episode.guest_name ?? "Guest"
  const guestEmail = episode.guests?.email ?? episode.guest_email
  const mailSubject = episode.topic
    ? `Podcast: ${episode.topic}`
    : "Podcast recording"
  const mailBody = [
    `Hi ${guestDisplayName},`,
    "",
    episode.notes ?? "",
  ].join("\n")

  const rescheduleHref =
    profile?.slug != null && profile.slug.length > 0
      ? `/schedule/${profile.slug}`
      : null

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/host/episodes"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            ← Episodes
          </Link>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            {episode.topic ?? "Untitled episode"}
          </h1>
          <p className="mt-2 font-mono text-[13px] text-muted-foreground">
            {formatRange(episode.starts_at, episode.ends_at)}
          </p>
        </div>
        <span className={cn("shrink-0", statusBadgeClass(episode.status))}>
          {formatStatusLabel(episode.status)}
        </span>
      </div>

      {q.error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          Something went wrong ({q.error}). Try again.
        </p>
      ) : null}
      {q.calendar === "ok" ? (
        <p className="rounded-md border border-[#86efac] bg-[#dcfce7]/40 px-3 py-2 text-sm text-[#166534]">
          Calendar sync completed.
        </p>
      ) : null}
      {q.calendar === "error" ? (
        <p className="rounded-md border border-[#fca5a5] bg-[#fee2e2]/40 px-3 py-2 text-sm text-[#991b1b]">
          Calendar sync failed. Check Google connection and try again.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <a
          href={gmailComposeUrl(guestEmail, mailSubject, mailBody)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants())}
        >
          Send email
        </a>
        {rescheduleHref ? (
          <Link
            href={rescheduleHref}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Reschedule
          </Link>
        ) : (
          <Button variant="outline" disabled title="Set a public slug in settings to enable scheduling links">
            Reschedule
          </Button>
        )}
        <form action={updateEpisodeStatus}>
          <input type="hidden" name="id" value={episode.id} />
          <input type="hidden" name="status" value="cancelled" />
          <Button type="submit" variant="destructive">
            Cancel episode
          </Button>
        </form>
      </div>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Guest</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 font-mono text-[13px]">
            <p>
              <span className="text-muted-foreground">Name: </span>
              {guestDisplayName}
            </p>
            <p className="break-all">
              <span className="text-muted-foreground">Email: </span>
              {guestEmail}
            </p>
            {episode.guests ? (
              <p>
                <Link
                  href={`/host/guests/${episode.guests.id}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  View guest profile
                </Link>
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Topic &amp; notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{episode.topic ?? "—"}</p>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {episode.notes ?? "No notes."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Riverside</CardTitle>
        </CardHeader>
        <CardContent>
          {episode.riverside_url ? (
            <a
              href={episode.riverside_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 block font-mono text-[13px] text-primary underline-offset-4 hover:underline break-all"
            >
              {episode.riverside_url}
            </a>
          ) : null}
          <form action={updateEpisode} className="flex max-w-xl flex-col gap-3 sm:flex-row sm:items-end">
            <input type="hidden" name="id" value={episode.id} />
            <input type="hidden" name="partial" value="riverside" />
            <div className="grid flex-1 gap-2">
              <Label htmlFor="riverside_url">Recording link</Label>
              <Input
                id="riverside_url"
                name="riverside_url"
                defaultValue={episode.riverside_url ?? ""}
                placeholder="https://riverside.fm/..."
                className="font-mono text-[13px]"
              />
            </div>
            <Button type="submit">Save</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <EpisodeStatusForm episodeId={episode.id} status={episode.status} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Google Calendar</CardTitle>
          <form action={syncEpisodeCalendar}>
            <input type="hidden" name="episodeId" value={episode.id} />
            <input
              type="hidden"
              name="hasGoogleEvent"
              value={episode.google_event_id ? "true" : "false"}
            />
            <Button type="submit" variant="secondary">
              {episode.google_event_id ? "Sync to calendar" : "Add to calendar"}
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-[13px] text-muted-foreground">
            {episode.google_event_id
              ? `Event ID: ${episode.google_event_id}`
              : "Not linked to a calendar event yet."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email history</CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sent</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Subject</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(emailRows ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    No messages logged for this episode.
                  </TableCell>
                </TableRow>
              ) : (
                (emailRows ?? []).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-[13px] whitespace-nowrap">
                      {new Date(row.sent_at).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </TableCell>
                    <TableCell className="font-mono text-[13px] break-all">
                      {row.recipient_email}
                    </TableCell>
                    <TableCell>{row.subject}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Separator />

      <form action={deleteEpisode} className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
        <input type="hidden" name="id" value={episode.id} />
        <p className="text-sm text-muted-foreground">
          Permanently delete this episode and related calendar link metadata.
        </p>
        <Button type="submit" variant="destructive">
          Delete episode
        </Button>
      </form>
    </div>
  )
}
