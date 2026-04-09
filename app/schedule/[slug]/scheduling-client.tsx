"use client"

import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Slot {
  start: string
  end: string
}

interface Props {
  slug: string
  hostName: string
  showName: string
  durationMinutes: number
  timezone: string
}

type Step = "pick" | "confirm" | "success"

export function SchedulingClient({
  slug,
  hostName,
  showName,
  durationMinutes,
  timezone,
}: Props) {
  const [step, setStep] = useState<Step>("pick")
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)

  const fetchSlots = useCallback(async () => {
    setLoading(true)
    const now = new Date()
    const rangeStart = new Date(now)
    rangeStart.setDate(rangeStart.getDate() + weekOffset * 7)
    if (weekOffset === 0) {
      rangeStart.setHours(0, 0, 0, 0)
    }
    const rangeEnd = new Date(rangeStart)
    rangeEnd.setDate(rangeEnd.getDate() + 7)

    try {
      const res = await fetch(
        `/api/schedule/slots?slug=${slug}&rangeStart=${rangeStart.toISOString()}&rangeEnd=${rangeEnd.toISOString()}`,
      )
      const data = await res.json()
      setSlots(data.slots ?? [])
    } catch {
      setSlots([])
    }
    setLoading(false)
  }, [slug, weekOffset])

  useEffect(() => {
    void fetchSlots()
  }, [fetchSlots])

  const slotsByDate = new Map<string, Slot[]>()
  for (const slot of slots) {
    const dateKey = new Date(slot.start).toLocaleDateString("en-CA", {
      timeZone: timezone,
    })
    const list = slotsByDate.get(dateKey) ?? []
    list.push(slot)
    slotsByDate.set(dateKey, list)
  }

  async function handleBook(formData: FormData) {
    if (!selectedSlot) return
    setSubmitting(true)

    try {
      const res = await fetch("/api/schedule/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          name: formData.get("name"),
          email: formData.get("email"),
          topic: formData.get("topic") || undefined,
          notes: formData.get("notes") || undefined,
          slotStart: selectedSlot.start,
          slotEnd: selectedSlot.end,
        }),
      })

      if (res.ok) {
        setStep("success")
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (step === "success") {
    const startDate = selectedSlot
      ? new Date(selectedSlot.start)
      : new Date()
    return (
      <div className="rounded-2xl border border-border p-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          You're booked!
        </h2>
        <p className="mt-3 text-muted-foreground">
          {startDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: timezone,
          })}{" "}
          at{" "}
          {startDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            timeZone: timezone,
          })}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          with {hostName}
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          A confirmation email has been sent to your inbox.
        </p>
      </div>
    )
  }

  if (step === "confirm" && selectedSlot) {
    const startDate = new Date(selectedSlot.start)
    return (
      <div className="rounded-2xl border border-border p-8">
        <h2 className="text-2xl font-semibold tracking-tight">
          Confirm your booking
        </h2>
        <p className="mt-2 text-muted-foreground">
          {startDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: timezone,
          })}{" "}
          at{" "}
          {startDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            timeZone: timezone,
          })}
        </p>
        <p className="text-sm text-muted-foreground">
          {durationMinutes} minutes
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            void handleBook(new FormData(e.currentTarget))
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              name="topic"
              placeholder="What should we discuss?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Anything the host should know beforehand?"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("pick")}
            >
              Back
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Booking..." : "Confirm booking"}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">
          Select a time
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={weekOffset === 0}
            onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
          >
            &larr;
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekOffset((w) => w + 1)}
          >
            &rarr;
          </Button>
        </div>
      </div>

      <p className="mt-1 text-sm text-muted-foreground">
        {durationMinutes} min &middot; {timezone}
      </p>

      {loading ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Loading available times...
        </p>
      ) : slots.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          No available times this week. Try the next week.
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          {Array.from(slotsByDate.entries()).map(([dateKey, daySlots]) => {
            const date = new Date(dateKey + "T00:00:00")
            return (
              <div key={dateKey}>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {date.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {daySlots.map((slot) => (
                    <Button
                      key={slot.start}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSlot(slot)
                        setStep("confirm")
                      }}
                    >
                      {new Date(slot.start).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        timeZone: timezone,
                      })}
                    </Button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
