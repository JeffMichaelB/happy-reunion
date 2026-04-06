import Link from "next/link"
import { notFound } from "next/navigation"

import { Button, buttonVariants } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

import { deleteBooking } from "./actions"

export default async function HostBookingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: rows, error } = await supabase
    .from("bookings")
    .select(
      "id, guest_email, guest_name, starts_at, ends_at, status, created_at",
    )
    .eq("host_id", user.id)
    .order("starts_at", { ascending: true, nullsFirst: false })

  if (error) {
    throw new Error(error.message)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-medium">Bookings</h1>
        <Link
          href="/host/bookings/new"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          New booking
        </Link>
      </div>

      {rows?.length ? (
        <ul className="divide-border border-border divide-y border text-sm">
          {rows.map((b) => (
            <li
              key={b.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <p className="font-medium">
                  {b.guest_name?.trim() || b.guest_email}
                </p>
                <p className="text-muted-foreground font-mono text-xs">
                  {b.guest_email}
                </p>
                <p className="text-muted-foreground text-xs">
                  {b.starts_at
                    ? new Date(b.starts_at).toLocaleString()
                    : "No start time"}{" "}
                  — {b.status.replaceAll("_", " ")}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Link
                  href={`/host/bookings/${b.id}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Edit
                </Link>
                <form action={deleteBooking}>
                  <input type="hidden" name="id" value={b.id} />
                  <Button type="submit" variant="destructive" size="sm">
                    Delete
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm">
          No bookings yet. Create one to try the host flow.
        </p>
      )}
    </div>
  )
}
