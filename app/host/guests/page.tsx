import Link from "next/link"
import { redirect } from "next/navigation"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export default async function GuestsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: guests, error: guestsError } = await supabase
    .from("guests")
    .select("id, name, email, company")
    .eq("host_id", user.id)
    .order("name", { ascending: true })

  if (guestsError) {
    return (
      <div className="text-sm text-destructive">
        Could not load guests. Please try again.
      </div>
    )
  }

  const guestList = guests ?? []
  const guestIds = guestList.map((g) => g.id)

  const episodeCountByGuest = new Map<string, number>()
  if (guestIds.length > 0) {
    const { data: bookingRows } = await supabase
      .from("bookings")
      .select("guest_id")
      .eq("host_id", user.id)
      .in("guest_id", guestIds)

    for (const row of bookingRows ?? []) {
      if (row.guest_id) {
        episodeCountByGuest.set(
          row.guest_id,
          (episodeCountByGuest.get(row.guest_id) ?? 0) + 1,
        )
      }
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Guests</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Everyone you&rsquo;ve shared a Reunion with.
          </p>
        </div>
        <Link
          href="/host/guests/new"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Add guest
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Directory
        </h2>

        {guestList.length === 0 ? (
          <p className="text-sm text-muted-foreground">No guests yet</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guestList.map((guest) => (
              <li key={guest.id}>
                <Link href={`/host/guests/${guest.id}`} className="block h-full">
                  <Card className="h-full transition-colors hover:border-[rgba(28,28,28,0.4)]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{guest.name}</CardTitle>
                      <p className="font-mono text-[13px] text-muted-foreground">
                        {guest.email}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        <span className="text-foreground font-medium">
                          {episodeCountByGuest.get(guest.id) ?? 0}
                        </span>{" "}
                        Reunion
                        {(episodeCountByGuest.get(guest.id) ?? 0) === 1
                          ? ""
                          : "s"}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
