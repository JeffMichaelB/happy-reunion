"use client"

import { useState } from "react"

import { updateEpisodeStatus } from "@/app/host/episodes/actions"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Enums } from "@/lib/database.types"

type BookingStatus = Enums<"booking_status">

const ALL_STATUSES: BookingStatus[] = [
  "draft",
  "pending_guest",
  "confirmed",
  "recorded",
  "published",
  "cancelled",
  "completed",
]

function formatStatusLabel(status: BookingStatus): string {
  switch (status) {
    case "pending_guest":
      return "Pending guest"
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

export function EpisodeStatusForm({
  episodeId,
  status,
}: {
  episodeId: string
  status: BookingStatus
}) {
  const [value, setValue] = useState<BookingStatus>(status)

  return (
    <form action={updateEpisodeStatus} className="flex max-w-sm flex-col gap-3">
      <input type="hidden" name="id" value={episodeId} />
      <input type="hidden" name="status" value={value} />
      <div className="grid gap-2">
        <Label htmlFor="episode-status">Change status</Label>
        <Select
          value={value}
          onValueChange={(v) => setValue(v as BookingStatus)}
        >
          <SelectTrigger id="episode-status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {formatStatusLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" variant="secondary" className="w-fit">
        Update status
      </Button>
    </form>
  )
}
