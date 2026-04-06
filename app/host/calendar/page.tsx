import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { WEEKDAYS } from "@/lib/host-form"
import { createClient } from "@/lib/supabase/server"
import {
  createAvailabilityWindow,
  deleteAvailabilityWindow,
  upsertSchedulingDefaults,
} from "./actions"

const inputClass =
  "border-input bg-background w-full border px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"

export default async function HostCalendarPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: defaults } = await supabase
    .from("host_scheduling_defaults")
    .select("*")
    .eq("host_id", user.id)
    .maybeSingle()

  const { data: windows, error: windowsError } = await supabase
    .from("availability_windows")
    .select("id, day_of_week, start_time, end_time")
    .eq("host_id", user.id)
    .order("day_of_week")
    .order("start_time")

  if (windowsError) {
    throw new Error(windowsError.message)
  }

  const d = defaults ?? {
    slot_duration_minutes: 30,
    buffer_before_minutes: 0,
    buffer_after_minutes: 0,
    min_notice_hours: 24,
    timezone: "UTC",
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-lg font-medium">Calendar & availability</h1>
        <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
          Set default slot length and buffers, then add weekly windows. Slot
          generation is not implemented yet; this only stores your rules.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-medium">Scheduling defaults</h2>
        <form
          action={upsertSchedulingDefaults}
          className="grid max-w-md gap-4 text-sm"
        >
          <label className="grid gap-1">
            <span className="text-muted-foreground">Slot duration (minutes)</span>
            <input
              className={inputClass}
              name="slot_duration_minutes"
              type="number"
              min={5}
              step={5}
              defaultValue={d.slot_duration_minutes}
              required
            />
          </label>
          <label className="grid gap-1">
            <span className="text-muted-foreground">Buffer before (minutes)</span>
            <input
              className={inputClass}
              name="buffer_before_minutes"
              type="number"
              min={0}
              step={5}
              defaultValue={d.buffer_before_minutes}
              required
            />
          </label>
          <label className="grid gap-1">
            <span className="text-muted-foreground">Buffer after (minutes)</span>
            <input
              className={inputClass}
              name="buffer_after_minutes"
              type="number"
              min={0}
              step={5}
              defaultValue={d.buffer_after_minutes}
              required
            />
          </label>
          <label className="grid gap-1">
            <span className="text-muted-foreground">Minimum notice (hours)</span>
            <input
              className={inputClass}
              name="min_notice_hours"
              type="number"
              min={0}
              step={1}
              defaultValue={d.min_notice_hours}
              required
            />
          </label>
          <label className="grid gap-1">
            <span className="text-muted-foreground">Timezone (IANA)</span>
            <input
              className={inputClass}
              name="timezone"
              type="text"
              defaultValue={d.timezone}
              placeholder="America/New_York"
              required
            />
          </label>
          <Button type="submit" className="w-fit">
            Save defaults
          </Button>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium">Weekly windows</h2>
        <form
          action={createAvailabilityWindow}
          className="grid max-w-md gap-4 text-sm"
        >
          <label className="grid gap-1">
            <span className="text-muted-foreground">Day</span>
            <select className={inputClass} name="day_of_week" required>
              {WEEKDAYS.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-muted-foreground">Start</span>
            <input className={inputClass} name="start_time" type="time" required />
          </label>
          <label className="grid gap-1">
            <span className="text-muted-foreground">End</span>
            <input className={inputClass} name="end_time" type="time" required />
          </label>
          <Button type="submit" className="w-fit">
            Add window
          </Button>
        </form>

        {windows?.length ? (
          <ul className="divide-border border-border max-w-md divide-y border text-sm">
            {windows.map((w) => {
              const label =
                WEEKDAYS.find((d) => d.value === w.day_of_week)?.label ??
                `Day ${w.day_of_week}`
              return (
                <li
                  key={w.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <span>
                    {label}: {w.start_time.slice(0, 5)}–{w.end_time.slice(0, 5)}
                  </span>
                  <form action={deleteAvailabilityWindow}>
                    <input type="hidden" name="id" value={w.id} />
                    <Button type="submit" variant="outline" size="sm">
                      Remove
                    </Button>
                  </form>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">
            No windows yet. Add at least one to describe when you are generally
            available.
          </p>
        )}
      </section>
    </div>
  )
}
