import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { WEEKDAYS } from "@/lib/host-form"
import { createClient } from "@/lib/supabase/server"

import {
  createAvailabilityWindow,
  deleteAvailabilityWindow,
  upsertSchedulingDefaults,
} from "./actions"
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

  const [defaultsRes, windowsRes, episodesRes] = await Promise.all([
    supabase
      .from("host_scheduling_defaults")
      .select("*")
      .eq("host_id", user.id)
      .maybeSingle(),
    supabase
      .from("availability_windows")
      .select("id, day_of_week, start_time, end_time")
      .eq("host_id", user.id)
      .order("day_of_week")
      .order("start_time"),
    supabase
      .from("bookings")
      .select("id, starts_at, ends_at, status, topic, guest_name, guests(name)")
      .eq("host_id", user.id)
      .not("starts_at", "is", null)
      .not("ends_at", "is", null)
      .in("status", ["draft", "pending_guest", "confirmed", "recorded"])
      .order("starts_at", { ascending: true }),
  ])

  const defaults = defaultsRes.data
  const windows = windowsRes.data ?? []
  const episodes = episodesRes.data ?? []

  const d = defaults ?? {
    slot_duration_minutes: 30,
    buffer_before_minutes: 0,
    buffer_after_minutes: 0,
    min_notice_hours: 24,
    timezone: "UTC",
  }

  const episodesForView = episodes.map((ep) => ({
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
        View your episode schedule and manage availability.
      </p>

      <Tabs defaultValue="schedule" className="mt-10">
        <TabsList>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-6">
          <CalendarScheduleView
            episodes={episodesForView}
            timezone={d.timezone}
          />
        </TabsContent>

        <TabsContent value="availability" className="mt-6 space-y-10">
          {/* Scheduling Defaults */}
          <section className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Scheduling Defaults
            </p>
            <form
              action={upsertSchedulingDefaults}
              className="grid max-w-md gap-4 text-sm"
            >
              <div className="space-y-2">
                <Label>Slot duration (minutes)</Label>
                <Input
                  name="slot_duration_minutes"
                  type="number"
                  min={5}
                  step={5}
                  defaultValue={d.slot_duration_minutes}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Buffer before (minutes)</Label>
                <Input
                  name="buffer_before_minutes"
                  type="number"
                  min={0}
                  step={5}
                  defaultValue={d.buffer_before_minutes}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Buffer after (minutes)</Label>
                <Input
                  name="buffer_after_minutes"
                  type="number"
                  min={0}
                  step={5}
                  defaultValue={d.buffer_after_minutes}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Minimum notice (hours)</Label>
                <Input
                  name="min_notice_hours"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={d.min_notice_hours}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Timezone (IANA)</Label>
                <Input
                  name="timezone"
                  type="text"
                  defaultValue={d.timezone}
                  placeholder="America/New_York"
                  required
                />
              </div>
              <Button type="submit" className="w-fit">
                Save defaults
              </Button>
            </form>
          </section>

          {/* Weekly Windows */}
          <section className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Weekly Windows
            </p>
            <form
              action={createAvailabilityWindow}
              className="grid max-w-md gap-4 text-sm"
            >
              <div className="space-y-2">
                <Label>Day</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  name="day_of_week"
                  required
                >
                  {WEEKDAYS.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Start</Label>
                <Input name="start_time" type="time" required />
              </div>
              <div className="space-y-2">
                <Label>End</Label>
                <Input name="end_time" type="time" required />
              </div>
              <Button type="submit" className="w-fit">
                Add window
              </Button>
            </form>

            {windows.length > 0 ? (
              <Card className="max-w-md rounded-xl">
                <CardContent className="divide-y divide-border py-0">
                  {windows.map((w) => {
                    const label =
                      WEEKDAYS.find((wd) => wd.value === w.day_of_week)
                        ?.label ?? `Day ${w.day_of_week}`
                    return (
                      <div
                        key={w.id}
                        className="flex items-center justify-between py-3"
                      >
                        <span className="text-sm">
                          {label}: {w.start_time.slice(0, 5)}&ndash;
                          {w.end_time.slice(0, 5)}
                        </span>
                        <form action={deleteAvailabilityWindow}>
                          <input type="hidden" name="id" value={w.id} />
                          <Button type="submit" variant="outline" size="sm">
                            Remove
                          </Button>
                        </form>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            ) : (
              <p className="text-sm text-muted-foreground">
                No windows yet. Add at least one to describe when you are
                available.
              </p>
            )}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  )
}
