import { Constants } from "@/lib/database.types"
import { toDatetimeLocalValue } from "@/lib/host-form"
import type { Tables } from "@/lib/database.types"

const inputClass =
  "border-input bg-background w-full border px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"

type BookingFormShape = Pick<
  Tables<"bookings">,
  "guest_email" | "guest_name" | "starts_at" | "ends_at" | "status" | "notes"
>

export function BookingFormFields({
  booking,
}: {
  booking?: Partial<BookingFormShape>
}) {
  const guest_email = booking?.guest_email ?? ""
  const guest_name = booking?.guest_name ?? ""
  const starts_at = toDatetimeLocalValue(booking?.starts_at ?? null)
  const ends_at = toDatetimeLocalValue(booking?.ends_at ?? null)
  const status = booking?.status ?? "draft"
  const notes = booking?.notes ?? ""

  return (
    <>
      <label className="grid gap-1 text-sm">
        <span className="text-muted-foreground">Guest email</span>
        <input
          className={inputClass}
          name="guest_email"
          type="email"
          required
          defaultValue={guest_email}
          autoComplete="email"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="text-muted-foreground">Guest name</span>
        <input
          className={inputClass}
          name="guest_name"
          type="text"
          defaultValue={guest_name}
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="text-muted-foreground">Starts</span>
        <input
          className={inputClass}
          name="starts_at"
          type="datetime-local"
          defaultValue={starts_at}
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="text-muted-foreground">Ends</span>
        <input
          className={inputClass}
          name="ends_at"
          type="datetime-local"
          defaultValue={ends_at}
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="text-muted-foreground">Status</span>
        <select className={inputClass} name="status" defaultValue={status}>
          {Constants.public.Enums.booking_status.map((s) => (
            <option key={s} value={s}>
              {s.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        <span className="text-muted-foreground">Notes</span>
        <textarea
          className={inputClass}
          name="notes"
          rows={3}
          defaultValue={notes}
        />
      </label>
    </>
  )
}
