import Link from "next/link"
import { notFound } from "next/navigation"

import { Button, buttonVariants } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

import { updateBooking } from "../actions"
import { BookingFormFields } from "../booking-form-fields"

export default async function EditBookingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      "id, guest_email, guest_name, starts_at, ends_at, status, notes, host_id",
    )
    .eq("id", id)
    .eq("host_id", user.id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }
  if (!booking) notFound()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-medium">Edit booking</h1>
        <Link
          href="/host/bookings"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Back
        </Link>
      </div>
      <form action={updateBooking} className="max-w-md space-y-4">
        <input type="hidden" name="id" value={booking.id} />
        <BookingFormFields booking={booking} />
        <Button type="submit">Save</Button>
      </form>
    </div>
  )
}
