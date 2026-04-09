import Link from "next/link"
import { redirect } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

import { CopyLinkButton } from "./copy-link-button"

const STATUS_CLASSES: Record<string, string> = {
  draft: "bg-[#f3f4f6] text-[#374151] border-[#d1d5db]",
  pending_guest: "bg-[#fef3c7] text-[#92400e] border-[#fcd34d]",
  confirmed: "bg-[#dcfce7] text-[#166534] border-[#86efac]",
  recorded: "bg-[#dbeafe] text-[#1e40af] border-[#93c5fd]",
  published: "bg-[#f3e8ff] text-[#6b21a8] border-[#c4b5fd]",
  cancelled: "bg-[#fee2e2] text-[#991b1b] border-[#fca5a5]",
  completed: "bg-[#f3f4f6] text-[#374151] border-[#d1d5db]",
}

function statusLabel(s: string) {
  return s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [profileRes, upcomingRes, guestsRes, statsRes, activityRes] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("slug, show_name, display_name")
        .eq("id", user.id)
        .single(),
      supabase
        .from("bookings")
        .select("id, starts_at, topic, status, guest_name, guests(name)")
        .eq("host_id", user.id)
        .in("status", ["confirmed", "pending_guest", "draft"])
        .not("starts_at", "is", null)
        .order("starts_at", { ascending: true })
        .limit(5),
      supabase
        .from("guests")
        .select("id", { count: "exact", head: true })
        .eq("host_id", user.id),
      supabase
        .from("bookings")
        .select("id, status", { count: "exact" })
        .eq("host_id", user.id),
      supabase
        .from("email_sends")
        .select("id, recipient_email, subject, sent_at")
        .eq("host_id", user.id)
        .order("sent_at", { ascending: false })
        .limit(5),
    ])

  const profile = profileRes.data
  const upcoming = upcomingRes.data ?? []
  const totalGuests = guestsRes.count ?? 0
  const allEpisodes = statsRes.data ?? []
  const recentEmails = activityRes.data ?? []

  const totalEpisodes = allEpisodes.length
  const pendingCount = allEpisodes.filter(
    (e) => e.status === "pending_guest",
  ).length
  const upcomingCount = allEpisodes.filter((e) =>
    ["confirmed", "pending_guest", "draft"].includes(e.status),
  ).length

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://happy-reunion.vercel.app"
  const scheduleLink = profile?.slug
    ? `${origin}/schedule/${profile.slug}`
    : null

  return (
    <div>
      <h1 className="text-4xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Overview of your podcast scheduling and guest management.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {/* Upcoming Episodes */}
        <div className="lg:col-span-2 space-y-6">
          <section>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Upcoming Episodes
            </p>
            <div className="mt-3 space-y-3">
              {upcoming.length === 0 ? (
                <Card className="rounded-xl">
                  <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    No upcoming episodes.{" "}
                    <Link
                      href="/host/episodes"
                      className="underline underline-offset-4"
                    >
                      Create one
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                upcoming.map((ep) => {
                  const guestName =
                    (ep.guests as { name: string } | null)?.name ??
                    ep.guest_name ??
                    "No guest"
                  return (
                    <Link key={ep.id} href={`/host/episodes/${ep.id}`}>
                      <Card className="rounded-xl transition-colors hover:border-[rgba(28,28,28,0.4)]">
                        <CardContent className="flex items-center justify-between py-4">
                          <div>
                            <p className="font-mono text-[13px] text-muted-foreground">
                              {ep.starts_at
                                ? new Date(ep.starts_at).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )
                                : "TBD"}
                            </p>
                            <p className="text-sm font-medium">{guestName}</p>
                            {ep.topic && (
                              <p className="text-sm text-muted-foreground">
                                &ldquo;{ep.topic}&rdquo;
                              </p>
                            )}
                          </div>
                          <Badge
                            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[ep.status] ?? ""}`}
                          >
                            {statusLabel(ep.status)}
                          </Badge>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })
              )}
            </div>
          </section>

          <section>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Recent Activity
            </p>
            <div className="mt-3">
              {recentEmails.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No recent activity yet.
                </p>
              ) : (
                <Card className="rounded-xl">
                  <CardContent className="divide-y divide-border py-0">
                    {recentEmails.map((em) => (
                      <div key={em.id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm">{em.subject}</p>
                          <p className="font-mono text-[13px] text-muted-foreground">
                            {em.recipient_email}
                          </p>
                        </div>
                        <p className="font-mono text-[13px] text-muted-foreground">
                          {new Date(em.sent_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar stats */}
        <div className="space-y-6">
          <section>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Quick Stats
            </p>
            <Card className="mt-3 rounded-xl">
              <CardContent className="grid grid-cols-2 gap-4 py-5">
                <div>
                  <p className="text-2xl font-semibold tracking-tight">
                    {upcomingCount}
                  </p>
                  <p className="text-xs text-muted-foreground">upcoming</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold tracking-tight">
                    {totalGuests}
                  </p>
                  <p className="text-xs text-muted-foreground">guests</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold tracking-tight">
                    {pendingCount}
                  </p>
                  <p className="text-xs text-muted-foreground">pending</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold tracking-tight">
                    {totalEpisodes}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    total episodes
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Scheduling Link
            </p>
            {scheduleLink ? (
              <Card className="mt-3 rounded-xl">
                <CardContent className="space-y-3 py-5">
                  <p className="break-all font-mono text-[13px]">
                    {scheduleLink}
                  </p>
                  <CopyLinkButton link={scheduleLink} />
                </CardContent>
              </Card>
            ) : (
              <Card className="mt-3 rounded-xl">
                <CardContent className="py-5">
                  <p className="text-sm text-muted-foreground">
                    Set a scheduling slug in{" "}
                    <Link
                      href="/host/settings"
                      className="underline underline-offset-4"
                    >
                      Settings
                    </Link>{" "}
                    to enable your public link.
                  </p>
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
