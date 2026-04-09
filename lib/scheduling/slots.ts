import type { Tables } from "@/lib/database.types"

export interface TimeSlot {
  start: Date
  end: Date
}

/**
 * Compute available booking slots for a host within a date range.
 *
 * Algorithm:
 * 1. For each day in [rangeStart, rangeEnd], generate candidate slots from
 *    the host's weekly availability windows + scheduling defaults.
 * 2. Remove any slot that overlaps with a Google Calendar busy block.
 * 3. Remove any slot that overlaps with an existing episode/booking.
 * 4. Remove any slot that starts before (now + minNoticeHours).
 */
export function computeAvailableSlots(params: {
  rangeStart: Date
  rangeEnd: Date
  windows: Pick<Tables<"availability_windows">, "day_of_week" | "start_time" | "end_time">[]
  defaults: Pick<
    Tables<"host_scheduling_defaults">,
    "slot_duration_minutes" | "buffer_before_minutes" | "buffer_after_minutes" | "min_notice_hours" | "timezone"
  >
  busyBlocks: TimeSlot[]
  existingEpisodes: TimeSlot[]
}): TimeSlot[] {
  const { rangeStart, rangeEnd, windows, defaults, busyBlocks, existingEpisodes } = params
  const {
    slot_duration_minutes: duration,
    buffer_before_minutes: bufferBefore,
    buffer_after_minutes: bufferAfter,
    min_notice_hours: minNotice,
    timezone,
  } = defaults

  const now = new Date()
  const minNoticeMs = minNotice * 60 * 60 * 1000
  const slotMs = duration * 60 * 1000
  const bufferBeforeMs = bufferBefore * 60 * 1000
  const bufferAfterMs = bufferAfter * 60 * 1000

  const windowsByDay = new Map<number, { start: string; end: string }[]>()
  for (const w of windows) {
    const list = windowsByDay.get(w.day_of_week) ?? []
    list.push({ start: w.start_time, end: w.end_time })
    windowsByDay.set(w.day_of_week, list)
  }

  const occupied = [...busyBlocks, ...existingEpisodes].sort(
    (a, b) => a.start.getTime() - b.start.getTime(),
  )

  const slots: TimeSlot[] = []

  const current = new Date(rangeStart)
  current.setHours(0, 0, 0, 0)

  while (current <= rangeEnd) {
    const dayOfWeek = getDayOfWeekInTimezone(current, timezone)
    const dayWindows = windowsByDay.get(dayOfWeek)

    if (dayWindows) {
      for (const window of dayWindows) {
        const windowStart = setTimeOnDate(current, window.start, timezone)
        const windowEnd = setTimeOnDate(current, window.end, timezone)

        let cursor = windowStart.getTime()
        while (cursor + slotMs <= windowEnd.getTime()) {
          const slotStart = new Date(cursor)
          const slotEnd = new Date(cursor + slotMs)

          if (slotStart.getTime() >= now.getTime() + minNoticeMs) {
            const blockStart = new Date(slotStart.getTime() - bufferBeforeMs)
            const blockEnd = new Date(slotEnd.getTime() + bufferAfterMs)

            if (!overlapsAny(blockStart, blockEnd, occupied)) {
              slots.push({ start: slotStart, end: slotEnd })
            }
          }

          cursor += slotMs
        }
      }
    }

    current.setDate(current.getDate() + 1)
  }

  return slots
}

function overlapsAny(start: Date, end: Date, blocks: TimeSlot[]): boolean {
  for (const block of blocks) {
    if (start < block.end && end > block.start) return true
    if (block.start >= end) break
  }
  return false
}

function getDayOfWeekInTimezone(date: Date, timezone: string): number {
  const formatted = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: timezone,
  }).format(date)

  const dayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  }
  return dayMap[formatted] ?? date.getDay()
}

function setTimeOnDate(date: Date, time: string, timezone: string): Date {
  const [hours, minutes] = time.split(":").map(Number)
  const dateStr = date.toLocaleDateString("en-CA", { timeZone: timezone })
  const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`
  const isoish = `${dateStr}T${timeStr}`

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date(isoish + "Z"))

  const approx = new Date(isoish + "Z")
  const localInTz = new Date(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
      .format(approx)
      .replace(",", ""),
  )

  const offsetMs = approx.getTime() - localInTz.getTime()

  const target = new Date(`${dateStr}T${timeStr}`)
  return new Date(target.getTime() + offsetMs)
}
