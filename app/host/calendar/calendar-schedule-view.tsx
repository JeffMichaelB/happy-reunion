"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Episode {
  id: string
  starts_at: string
  ends_at: string
  status: string
  topic: string | null
  guest_name: string
  statusClass: string
}

interface Props {
  episodes: Episode[]
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function statusLabel(s: string) {
  return s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

// Render in the viewer's local timezone so times match the dashboard and
// episode pages (which also use local time).
function formatChipTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

export function CalendarScheduleView({ episodes }: Props) {
  const [monthOffset, setMonthOffset] = useState(0)

  const { year, month, weeks, monthLabel } = useMemo(() => {
    const now = new Date()
    const target = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
    const y = target.getFullYear()
    const m = target.getMonth()

    const label = target.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })

    const firstDay = new Date(y, m, 1).getDay()
    const daysInMonth = new Date(y, m + 1, 0).getDate()

    const wks: (number | null)[][] = []
    let week: (number | null)[] = Array(firstDay).fill(null) as (number | null)[]

    for (let d = 1; d <= daysInMonth; d++) {
      week.push(d)
      if (week.length === 7) {
        wks.push(week)
        week = []
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null)
      wks.push(week)
    }

    return { year: y, month: m, weeks: wks, monthLabel: label }
  }, [monthOffset])

  const episodesByDay = useMemo(() => {
    const map = new Map<number, Episode[]>()
    for (const ep of episodes) {
      const d = new Date(ep.starts_at)
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate()
        const list = map.get(day) ?? []
        list.push(ep)
        map.set(day, list)
      }
    }
    return map
  }, [episodes, year, month])

  const monthEpisodes = useMemo(() => {
    return episodes
      .filter((ep) => {
        const d = new Date(ep.starts_at)
        return d.getFullYear() === year && d.getMonth() === month
      })
      .sort(
        (a, b) =>
          new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
      )
  }, [episodes, year, month])

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">{monthLabel}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMonthOffset((o) => o - 1)}
          >
            &larr;
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMonthOffset(0)}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMonthOffset((o) => o + 1)}
          >
            &rarr;
          </Button>
        </div>
      </div>

      {/* Mobile: agenda list (the month grid is unreadable at phone widths) */}
      <div className="mt-4 space-y-2 md:hidden">
        {monthEpisodes.length === 0 ? (
          <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            No Reunions this month.
          </p>
        ) : (
          monthEpisodes.map((ep) => (
            <Link
              key={ep.id}
              href={`/host/episodes/${ep.id}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-[rgba(28,28,28,0.4)]"
            >
              <div className="flex w-12 shrink-0 flex-col items-center">
                <span className="text-lg font-semibold leading-none tracking-tight">
                  {new Date(ep.starts_at).getDate()}
                </span>
                <span className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {new Date(ep.starts_at).toLocaleDateString("en-US", {
                    weekday: "short",
                  })}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{ep.guest_name}</p>
                <p className="font-mono text-[12px] text-muted-foreground">
                  {formatChipTime(ep.starts_at)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${ep.statusClass}`}
              >
                {statusLabel(ep.status)}
              </span>
            </Link>
          ))
        )}
      </div>

      <Card className="mt-4 hidden overflow-hidden rounded-xl md:block">
        <CardContent className="p-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {DAY_LABELS.map((d) => (
              <div
                key={d}
                className="px-2 py-2 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 border-b border-border last:border-b-0">
              {week.map((day, di) => {
                const dayEpisodes = day ? episodesByDay.get(day) ?? [] : []
                const isToday =
                  day !== null &&
                  year === new Date().getFullYear() &&
                  month === new Date().getMonth() &&
                  day === new Date().getDate()

                return (
                  <div
                    key={di}
                    className={`min-h-[80px] border-r border-border p-1.5 last:border-r-0 ${
                      day === null ? "bg-muted/30" : ""
                    }`}
                  >
                    {day !== null && (
                      <>
                        <p
                          className={`text-xs ${
                            isToday
                              ? "inline-flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {day}
                        </p>
                        <div className="mt-1 space-y-1">
                          {dayEpisodes.map((ep) => (
                            <Link
                              key={ep.id}
                              href={`/host/episodes/${ep.id}`}
                              className={`block rounded px-1 py-0.5 text-[10px] font-medium leading-tight border ${ep.statusClass} truncate hover:opacity-80 transition-opacity`}
                              title={`${ep.guest_name}: ${ep.topic ?? "Recording"} (${statusLabel(ep.status)})`}
                            >
                              {formatChipTime(ep.starts_at)}{" "}
                              {ep.guest_name.split(" ")[0]}
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded border border-[#86efac] bg-[#dcfce7]" />
          Confirmed
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded border border-[#fcd34d] bg-[#fef3c7]" />
          Pending
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded border border-[#d1d5db] bg-[#f3f4f6]" />
          Draft
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded border border-[#93c5fd] bg-[#dbeafe]" />
          Recorded
        </div>
      </div>
    </div>
  )
}
