const CAL_COM_TITLE_PATTERN =
  /^\d+\s*min(?:ute)?\s+meeting\s+between\s+.+\s+and\s+/i

/** Hide Cal.com auto-generated titles like "30 min meeting between Host and Guest". */
export function displayTopic(topic: string | null | undefined): string | null {
  const trimmed = topic?.trim()
  if (!trimmed) return null
  if (CAL_COM_TITLE_PATTERN.test(trimmed)) return null
  return trimmed
}

export function formatUpcomingDate(iso: string | null): string {
  if (!iso) return "TBD"
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "TBD"
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}
