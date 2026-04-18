import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { deleteGuest, updateGuest } from "@/app/host/guests/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import type { Database } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/server"

type BookingStatus = Database["public"]["Enums"]["booking_status"]

function statusBadgeClass(status: BookingStatus): string {
  switch (status) {
    case "draft":
      return "bg-[#f3f4f6] text-[#374151] border border-[#d1d5db]"
    case "pending_guest":
      return "bg-[#fef3c7] text-[#92400e] border border-[#fcd34d]"
    case "confirmed":
      return "bg-[#dcfce7] text-[#166534] border border-[#86efac]"
    case "recorded":
      return "bg-[#dbeafe] text-[#1e40af] border border-[#93c5fd]"
    case "published":
      return "bg-[#f3e8ff] text-[#6b21a8] border border-[#c4b5fd]"
    case "cancelled":
      return "bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]"
    case "completed":
      return "bg-[#f3f4f6] text-[#374151] border border-[#d1d5db]"
    default: {
      const _exhaustive: never = status
      return _exhaustive
    }
  }
}

function formatEpisodeDate(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default async function GuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: guest, error: guestError } = await supabase
    .from("guests")
    .select("*")
    .eq("id", id)
    .eq("host_id", user.id)
    .maybeSingle()

  if (guestError || !guest) {
    notFound()
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      "id, starts_at, topic, status, riverside_url",
    )
    .eq("host_id", user.id)
    .eq("guest_id", id)
    .order("starts_at", { ascending: false, nullsFirst: false })

  const episodeRows = bookings ?? []

  return (
    <div className="space-y-10 bg-[#f7f4ed] -mx-8 -my-6 px-8 py-6 min-h-full text-[#1c1c1c]">
      <div>
        <Link
          href="/host/guests"
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Back to guests
        </Link>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          {guest.name}
        </h1>
        <p className="mt-1 font-mono text-[13px] text-muted-foreground">
          {guest.email}
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Profile
        </h2>
        <Card className="max-w-xl rounded-xl border-border">
          <CardHeader>
            <CardTitle>Edit guest</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateGuest} className="space-y-6">
              <input type="hidden" name="id" value={guest.id} />
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  defaultValue={guest.name}
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  defaultValue={guest.email}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  defaultValue={guest.bio ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  defaultValue={guest.notes ?? ""}
                />
              </div>
              <Button type="submit">Save changes</Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Episode history
        </h2>
        <Card className="rounded-xl border-border">
          <CardContent className="pt-6">
            {episodeRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No episodes linked to this guest yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Riverside</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {episodeRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatEpisodeDate(row.starts_at)}
                      </TableCell>
                      <TableCell>
                        {row.topic?.trim() ? row.topic : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusBadgeClass(row.status)}
                        >
                          {row.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {row.riverside_url ? (
                          <a
                            href={row.riverside_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                          >
                            Open
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Danger zone
        </h2>
        <Card className="max-w-xl rounded-xl border-border border-destructive/30">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Permanently remove this guest from your directory. Episodes stay
              in your account; the guest link on those bookings will be cleared
              if your database is set to set null on delete.
            </p>
            <form action={deleteGuest} className="mt-4">
              <input type="hidden" name="id" value={guest.id} />
              <Button type="submit" variant="destructive">
                Delete guest
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
