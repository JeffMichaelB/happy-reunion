import { Constants, type Enums } from "@/lib/database.types"

export function optionalText(value: FormDataEntryValue | null): string | null {
  if (value == null || typeof value !== "string") return null
  const t = value.trim()
  return t.length ? t : null
}

export function parseOptionalTimestamptz(
  value: FormDataEntryValue | null,
): string | null {
  if (value == null || typeof value !== "string") return null
  const t = value.trim()
  if (!t) return null
  const d = new Date(t)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

export function parseBookingStatus(
  value: FormDataEntryValue | null,
): Enums<"booking_status"> {
  const raw = typeof value === "string" ? value : ""
  return (
    Constants.public.Enums.booking_status as readonly string[]
  ).includes(raw)
    ? (raw as Enums<"booking_status">)
    : "draft"
}

export function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const WEEKDAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
] as const
