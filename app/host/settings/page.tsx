import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"

import { getEventTypes } from "@/lib/calcom/api"
import { SignOutButton } from "@/components/sign-out-button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

import {
  deleteAccount,
  disconnectCalCom,
  selectEventType,
  updateProfile,
  uploadAvatar,
} from "./actions"
import { CopyScheduleLinkButton } from "./copy-schedule-link-button"

function initialsFromName(name: string | null | undefined) {
  if (!name?.trim()) return "?"
  const parts = name.trim().split(/\s+/)
  const a = parts[0]?.[0] ?? ""
  const b = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : ""
  return (a + b).toUpperCase() || "?"
}

export default async function HostSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ calcom?: string }>
}) {
  const q = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "display_name, show_name, show_description, slug, avatar_url, cal_com_booking_url",
    )
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    throw new Error(profileError?.message ?? "Profile not found")
  }

  const admin = createAdminClient()
  const { data: calComCreds } = await admin
    .from("host_calcom_credentials")
    .select("user_id, calcom_username, selected_event_type_id, selected_event_type_slug")
    .eq("user_id", user.id)
    .maybeSingle()

  const calComConnected = !!calComCreds

  let eventTypes: { id: number; slug: string; title: string; length: number }[] = []
  if (calComConnected) {
    try {
      eventTypes = await getEventTypes(user.id)
    } catch {
      eventTypes = []
    }
  }

  let avatarSignedUrl: string | null = null
  if (profile.avatar_url) {
    if (profile.avatar_url.startsWith("http")) {
      avatarSignedUrl = profile.avatar_url
    } else {
      const { data: signed } = await supabase.storage
        .from("avatars")
        .createSignedUrl(profile.avatar_url, 3600)
      avatarSignedUrl = signed?.signedUrl ?? null
    }
  }

  const selectClass =
    "border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm outline-none transition-[color,box-shadow] focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[rgba(59,130,246,0.5)] disabled:cursor-not-allowed disabled:opacity-50"

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground leading-relaxed">
          Profile, scheduling integration, and account.
        </p>
      </div>

      {q.calcom === "connected" ? (
        <p className="rounded-md border border-[#86efac] bg-[#dcfce7]/40 px-3 py-2 text-sm text-[#166534]">
          Cal.com connected successfully. Select an event type below to finish setup.
        </p>
      ) : null}
      {q.calcom === "error" ? (
        <p className="rounded-md border border-[#fca5a5] bg-[#fee2e2]/40 px-3 py-2 text-sm text-[#991b1b]">
          Failed to connect Cal.com. Please try again.
        </p>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Profile
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              How you and your show appear to guests.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <Avatar size="lg" className="size-16">
                {avatarSignedUrl ? (
                  <AvatarImage src={avatarSignedUrl} alt="" />
                ) : null}
                <AvatarFallback className="text-base">
                  {initialsFromName(profile.display_name)}
                </AvatarFallback>
              </Avatar>
              <form action={uploadAvatar} className="flex flex-col gap-2">
                <Label htmlFor="avatar">Avatar</Label>
                <Input
                  id="avatar"
                  name="avatar"
                  type="file"
                  accept="image/*"
                  className="cursor-pointer"
                />
                <Button type="submit" variant="secondary" size="sm">
                  Upload image
                </Button>
              </form>
            </div>

            <Separator />

            <form action={updateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display_name">Display name</Label>
                <Input
                  id="display_name"
                  name="display_name"
                  defaultValue={profile.display_name ?? ""}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="show_name">Show name</Label>
                <Input
                  id="show_name"
                  name="show_name"
                  defaultValue={profile.show_name ?? ""}
                  placeholder="Podcast title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="show_description">Show description</Label>
                <Textarea
                  id="show_description"
                  name="show_description"
                  defaultValue={profile.show_description ?? ""}
                  placeholder="A short description of your show"
                  className="min-h-24"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Custom slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  defaultValue={profile.slug ?? ""}
                  placeholder="your-show"
                />
                <p className="text-xs text-muted-foreground">
                  Lowercase letters, numbers, and hyphens only.
                </p>
              </div>
              <Button type="submit">Save profile</Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Cal.com scheduling
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>Cal.com</CardTitle>
            <CardDescription>
              Connect your Cal.com account to manage scheduling directly from
              your dashboard. Guests book via your Cal.com link; bookings sync
              back here automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm">
                Status:{" "}
                <span className="font-medium text-foreground">
                  {calComConnected
                    ? `Connected${calComCreds.calcom_username ? ` as ${calComCreds.calcom_username}` : ""}`
                    : "Not connected"}
                </span>
              </span>
              {!calComConnected ? (
                <Link
                  href="/api/calcom/connect"
                  className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  Connect Cal.com
                </Link>
              ) : null}
            </div>

            {calComConnected ? (
              <>
                <Separator />
                <form action={selectEventType} className="space-y-3">
                  <Label htmlFor="event_type_id">Event type for guest bookings</Label>
                  <select
                    id="event_type_id"
                    name="event_type_id"
                    defaultValue={calComCreds.selected_event_type_id ?? ""}
                    className={selectClass}
                  >
                    <option value="">Select an event type...</option>
                    {eventTypes.map((et) => (
                      <option key={et.id} value={et.id}>
                        {et.title} ({et.length} min)
                      </option>
                    ))}
                  </select>
                  {eventTypes.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No event types found. Create one in Cal.com first.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Selecting an event type auto-registers a webhook so
                      bookings sync to your episode pipeline.
                    </p>
                  )}
                  <Button type="submit" variant="secondary" size="sm">
                    Save event type
                  </Button>
                </form>

                {profile.cal_com_booking_url ? (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Booking link</Label>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                        <div className="min-w-0 flex-1">
                          <Input
                            readOnly
                            value={profile.cal_com_booking_url}
                            className="font-mono text-xs"
                          />
                        </div>
                        <CopyScheduleLinkButton url={profile.cal_com_booking_url} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Share this link with guests so they can book time with you.
                      </p>
                    </div>
                  </>
                ) : null}
              </>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Session
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>Signed in</CardTitle>
            <CardDescription>
              You are signed in to The Reunion Projects on this device.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[13px] text-foreground break-all">
              {user.email}
            </p>
            <SignOutButton />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Danger zone
        </h2>
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Disconnect &amp; account</CardTitle>
            <CardDescription>
              Disconnecting Cal.com stops booking sync. Deleting your account is
              permanent.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {calComConnected ? (
              <form action={disconnectCalCom}>
                <Button type="submit" variant="destructive">
                  Disconnect Cal.com
                </Button>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground">
                Cal.com is not connected.
              </p>
            )}

            <Separator />

            <form action={deleteAccount} className="max-w-md space-y-3">
              <Label htmlFor="confirm_delete">Delete account</Label>
              <p className="text-xs text-muted-foreground">
                Type <span className="font-mono">DELETE</span> to confirm. This
                removes your host data and cannot be undone.
              </p>
              <Input
                id="confirm_delete"
                name="confirm_delete"
                placeholder="DELETE"
                autoComplete="off"
              />
              <Button type="submit" variant="destructive">
                Delete my account
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
