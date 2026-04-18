import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { GoogleSignInButton } from "@/app/login/google-sign-in-button"
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
import { getCalendarClient } from "@/lib/google/client"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

import {
  deleteAccount,
  disconnectGoogle,
  updateDefaultCalendar,
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

async function resolveSiteOrigin() {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")
  if (env) return env

  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host")
  const proto = h.get("x-forwarded-proto") ?? "https"
  return host ? `${proto}://${host}` : ""
}

export default async function HostSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "display_name, show_name, show_description, slug, avatar_url, default_calendar_id",
    )
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    throw new Error(profileError?.message ?? "Profile not found")
  }

  const admin = createAdminClient()
  const { data: googleRow } = await admin
    .from("host_google_credentials")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle()

  const googleConnected = !!googleRow

  let calendars: { id: string | null | undefined; summary: string | null | undefined; primary: boolean | null | undefined }[] =
    []

  if (googleConnected) {
    try {
      const calendar = await getCalendarClient(user.id)
      const res = await calendar.calendarList.list({ minAccessRole: "owner" })
      calendars = (res.data.items ?? []).map((c) => ({
        id: c.id,
        summary: c.summary,
        primary: c.primary ?? false,
      }))
    } catch {
      calendars = []
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

  const origin = await resolveSiteOrigin()
  const slug = profile.slug?.trim() ?? ""
  const scheduleUrl =
    slug && origin ? `${origin}/schedule/${encodeURIComponent(slug)}` : ""

  const selectClass =
    "border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm outline-none transition-[color,box-shadow] focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[rgba(59,130,246,0.5)] disabled:cursor-not-allowed disabled:opacity-50"

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground leading-relaxed">
          Profile, your public scheduling link, and Google Calendar.
        </p>
      </div>

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
                  placeholder="A short description for your booking page"
                  className="min-h-24"
                />
              </div>
              <Button type="submit">Save profile</Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Scheduling link
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>Scheduling link</CardTitle>
            <CardDescription>
              Share this URL so guests can book time on your calendar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form action={updateProfile} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="slug">Custom slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  defaultValue={profile.slug ?? ""}
                  placeholder="your-show"
                />
                <p className="text-xs text-muted-foreground">
                  Lowercase letters, numbers, and hyphens only. This becomes your
                  public URL.
                </p>
              </div>
              <Button type="submit" variant="secondary" size="sm">
                Save slug
              </Button>
            </form>

            <Separator />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1 space-y-2">
                <Label htmlFor="schedule-url">Public URL</Label>
                <Input
                  id="schedule-url"
                  readOnly
                  value={
                    scheduleUrl ||
                    "Set a slug above to generate your scheduling link"
                  }
                  className="font-mono text-xs"
                />
              </div>
              <CopyScheduleLinkButton url={scheduleUrl} />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Google integration
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>Google Calendar</CardTitle>
            <CardDescription>
              Connect Google to sync recordings and pick a default calendar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm">
                Status:{" "}
                <span className="font-medium text-foreground">
                  {googleConnected ? "Connected" : "Not connected"}
                </span>
              </span>
              {!googleConnected ? <GoogleSignInButton /> : null}
            </div>

            {googleConnected ? (
              <form action={updateDefaultCalendar} className="space-y-3">
                <Label htmlFor="default_calendar_id">Default calendar</Label>
                <select
                  id="default_calendar_id"
                  name="default_calendar_id"
                  defaultValue={profile.default_calendar_id ?? ""}
                  className={selectClass}
                >
                  <option value="">Primary (default)</option>
                  {calendars.map((c) => {
                    const id = c.id ?? ""
                    if (!id) return null
                    const label =
                      (c.summary ?? id) + (c.primary ? " (primary)" : "")
                    return (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    )
                  })}
                </select>
                {calendars.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Calendars could not be loaded. Try reconnecting Google.
                  </p>
                ) : null}
                <Button type="submit" variant="secondary" size="sm">
                  Save calendar
                </Button>
              </form>
            ) : null}

            {googleConnected ? (
              <div className="flex flex-wrap items-center gap-2">
                <GoogleSignInButton />
                <span className="text-xs text-muted-foreground">
                  Reconnect to refresh permissions or tokens.
                </span>
              </div>
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
              Removing Google stops calendar sync. Deleting your account is
              permanent.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {googleConnected ? (
              <form action={disconnectGoogle}>
                <Button type="submit" variant="destructive">
                  Disconnect Google
                </Button>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground">
                Google is not connected.
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
