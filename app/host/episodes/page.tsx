import Link from "next/link"
import { redirect } from "next/navigation"

import { createEpisode } from "@/app/host/episodes/actions"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { displayTopic } from "@/lib/bookings/display"
import type { Enums } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

type BookingStatus = Enums<"booking_status">

type EpisodeRow = {
  id: string
  starts_at: string | null
  ends_at: string | null
  guest_email: string
  guest_name: string | null
  topic: string | null
  status: BookingStatus
  riverside_url: string | null
  guests: { id: string; name: string; email: string } | null
}

const PIPELINE_STATUSES = [
  "draft",
  "pending_guest",
  "confirmed",
  "recorded",
  "published",
] as const satisfies readonly BookingStatus[]

const PIPELINE_LABELS: Record<(typeof PIPELINE_STATUSES)[number], string> = {
  draft: "Draft",
  pending_guest: "Pending",
  confirmed: "Confirmed",
  recorded: "Recorded",
  published: "Published",
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
    case "recorded":
      return "Recorded"
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

function displayGuestName(row: EpisodeRow): string {
  return row.guests?.name ?? row.guest_name ?? "—"
}

function formatEpisodeDate(iso: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function truncate(s: string | null, max: number): string {
  if (!s) return "—"
  if (s.length <= max) return s
  return `${s.slice(0, max)}…`
}

export default async function EpisodesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: rawEpisodes } = await supabase
    .from("bookings")
    .select(
      "id, starts_at, ends_at, guest_email, guest_name, topic, status, riverside_url, guests ( id, name, email )",
    )
    .eq("host_id", user.id)
    .order("starts_at", { ascending: false, nullsFirst: false })

  const episodes = (rawEpisodes ?? []) as EpisodeRow[]

  const { data: guestList } = await supabase
    .from("guests")
    .select("id, name, email")
    .eq("host_id", user.id)
    .order("name")

  const closedEpisodes = episodes.filter(
    (e) => e.status === "cancelled" || e.status === "completed",
  )

  const byPipelineColumn = (status: BookingStatus) =>
    episodes.filter((e) => e.status === status)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Reunions</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Every Reunion — past, present, and future.
          </p>
        </div>
        <Link href="#new-episode" className={cn(buttonVariants())}>
          New Reunion
        </Link>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          {episodes.length === 0 ? (
            <p className="px-1 py-8 text-sm text-muted-foreground">
              No Reunions yet. Create one below.
            </p>
          ) : (
            <>
              {/* Mobile: stacked cards (the table hides Status behind a scroll) */}
              <ul className="space-y-3 md:hidden">
                {episodes.map((row) => {
                  const topic = displayTopic(row.topic)
                  return (
                    <li key={row.id}>
                      <Link
                        href={`/host/episodes/${row.id}`}
                        className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-[rgba(28,28,28,0.4)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-mono text-[13px] text-muted-foreground">
                            {formatEpisodeDate(row.starts_at)}
                          </span>
                          <span className={statusBadgeClass(row.status)}>
                            {formatStatusLabel(row.status)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-medium">
                          {displayGuestName(row)}
                        </p>
                        {topic ? (
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                            {topic}
                          </p>
                        ) : null}
                      </Link>
                    </li>
                  )
                })}
              </ul>

              {/* Desktop: table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Guest</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {episodes.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-[13px] text-muted-foreground">
                          {formatEpisodeDate(row.starts_at)}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/host/episodes/${row.id}`}
                            className="font-medium text-foreground underline-offset-4 hover:underline"
                          >
                            {displayGuestName(row)}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className={statusBadgeClass(row.status)}>
                            {formatStatusLabel(row.status)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="pipeline" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {PIPELINE_STATUSES.map((status) => (
              <div key={status} className="flex flex-col gap-3 md:min-h-[280px]">
                <h2 className="text-sm font-semibold tracking-tight">
                  {PIPELINE_LABELS[status]}
                </h2>
                <div className="flex flex-1 flex-col gap-2 rounded-xl border border-border bg-background p-2">
                  {byPipelineColumn(status).length === 0 ? (
                    <p className="p-2 text-xs text-muted-foreground">
                      No Reunions
                    </p>
                  ) : (
                    byPipelineColumn(status).map((row) => {
                      const topic = displayTopic(row.topic)
                      return (
                        <Link
                          key={row.id}
                          href={`/host/episodes/${row.id}`}
                          className="block rounded-md border border-border bg-background p-3 transition-colors hover:border-[rgba(28,28,28,0.4)]"
                        >
                          <p className="font-mono text-[13px] text-muted-foreground">
                            {formatEpisodeDate(row.starts_at)}
                          </p>
                          <p className="mt-1 text-sm font-medium">
                            {displayGuestName(row)}
                          </p>
                          {topic ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {truncate(topic, 72)}
                            </p>
                          ) : null}
                        </Link>
                      )
                    })
                  )}
                </div>
              </div>
            ))}
          </div>

          {closedEpisodes.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Closed (cancelled &amp; completed)
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {closedEpisodes.map((row) => (
                  <Link
                    key={row.id}
                    href={`/host/episodes/${row.id}`}
                    className="inline-flex max-w-xs flex-col rounded-md border border-border bg-background p-3 text-left transition-colors hover:border-[rgba(28,28,28,0.4)]"
                  >
                    <span className="font-mono text-[13px] text-muted-foreground">
                      {formatEpisodeDate(row.starts_at)}
                    </span>
                    <span className="mt-1 text-sm font-medium">
                      {displayGuestName(row)}
                    </span>
                    <span className={cn("mt-2 w-fit", statusBadgeClass(row.status))}>
                      {formatStatusLabel(row.status)}
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>
      </Tabs>

      <Card id="new-episode" className="scroll-mt-8">
        <CardHeader>
          <CardTitle className="text-base">Create Reunion</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createEpisode} className="grid max-w-xl gap-4">
            <div className="grid gap-2">
              <Label htmlFor="guest_email">Guest email</Label>
              <Input
                id="guest_email"
                name="guest_email"
                type="email"
                required
                autoComplete="email"
                className="font-mono text-[13px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="guest_name">Guest name</Label>
              <Input
                id="guest_name"
                name="guest_name"
                required
                autoComplete="name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="guest_id">Link to guest record (optional)</Label>
              <select
                id="guest_id"
                name="guest_id"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm outline-none transition-[color,box-shadow] focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[rgba(28,28,28,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">— None —</option>
                {(guestList ?? []).map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="starts_at">Starts at</Label>
                <Input
                  id="starts_at"
                  name="starts_at"
                  type="datetime-local"
                  className="font-mono text-[13px]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ends_at">Ends at</Label>
                <Input
                  id="ends_at"
                  name="ends_at"
                  type="datetime-local"
                  className="font-mono text-[13px]"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="topic">Topic</Label>
              <Input id="topic" name="topic" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={3} />
            </div>
            <Button type="submit">Create draft</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
