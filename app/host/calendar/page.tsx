import { notFound } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

import { CalendarScheduleView } from "./calendar-schedule-view"

const STATUS_CLASSES: Record<string, string> = {
  draft: "bg-[#f3f4f6] text-[#374151] border-[#d1d5db]",
  pending_guest: "bg-[#fef3c7] text-[#92400e] border-[#fcd34d]",
  confirmed: "bg-[#dcfce7] text-[#166534] border-[#86efac]",
  recorded: "bg-[#dbeafe] text-[#1e40af] border-[#93c5fd]",
  published: "bg-[#f3e8ff] text-[#6b21a8] border-[#c4b5fd]",
  cancelled: "bg-[#fee2e2] text-[#991b1b] border-[#fca5a5]",
  completed: "bg-[#f3f4f6] text-[#374151] border-[#d1d5db]",
}

export default async function HostCalendarPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: episodes } = await supabase
    .from("bookings")
    .select("id, starts_at, ends_at, status, topic, guest_name, guests(name)")
    .eq("host_id", user.id)
    .not("starts_at", "is", null)
    .not("ends_at", "is", null)
    .in("status", ["draft", "pending_guest", "confirmed", "recorded"])
    .order("starts_at", { ascending: true })

  const episodesForView = (episodes ?? []).map((ep) => ({
    id: ep.id,
    starts_at: ep.starts_at!,
    ends_at: ep.ends_at!,
    status: ep.status,
    topic: ep.topic,
    guest_name:
      (ep.guests as { name: string } | null)?.name ?? ep.guest_name ?? "Guest",
    statusClass: STATUS_CLASSES[ep.status] ?? "",
  }))

  return (
    <div>
      <h1 className="text-4xl font-semibold tracking-tight">Calendar</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        View your Reunion schedule.
      </p>

      <div className="mt-10">
        <CalendarScheduleView episodes={episodesForView} />
      </div>
    </div>
  )
}
