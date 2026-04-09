import { notFound } from "next/navigation"

import { createAdminClient } from "@/lib/supabase/admin"

import { SchedulingClient } from "./scheduling-client"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PublicSchedulePage({ params }: Props) {
  const { slug } = await params

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from("profiles")
    .select("id, display_name, show_name, show_description, avatar_url, slug")
    .eq("slug", slug)
    .single()

  if (!profile) notFound()

  const { data: defaults } = await admin
    .from("host_scheduling_defaults")
    .select("slot_duration_minutes, timezone")
    .eq("host_id", profile.id)
    .single()

  return (
    <div className="flex min-h-svh items-start justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center">
          <h1 className="font-heading text-[40px] font-bold tracking-tight">
            {profile.show_name ?? profile.display_name ?? "Podcast"}
          </h1>
          {profile.show_description && (
            <p className="mt-2 text-base text-muted-foreground">
              {profile.show_description}
            </p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            with {profile.display_name}
          </p>
        </div>

        <div className="mt-10">
          <SchedulingClient
            slug={slug}
            hostName={profile.display_name ?? "Host"}
            showName={profile.show_name ?? profile.display_name ?? "Podcast"}
            durationMinutes={defaults?.slot_duration_minutes ?? 30}
            timezone={defaults?.timezone ?? "UTC"}
          />
        </div>
      </div>
    </div>
  )
}
