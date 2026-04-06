import Link from "next/link"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { createBooking } from "../actions"
import { BookingFormFields } from "../booking-form-fields"

export default function NewBookingPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-medium">New booking</h1>
        <Link
          href="/host/bookings"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Back
        </Link>
      </div>
      <form action={createBooking} className="max-w-md space-y-4">
        <BookingFormFields />
        <Button type="submit">Create</Button>
      </form>
    </div>
  )
}
