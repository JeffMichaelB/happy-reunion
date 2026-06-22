import Link from "next/link"
import { redirect } from "next/navigation"

import { createGuest } from "@/app/host/guests/actions"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/server"

export default async function NewGuestPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/host/guests"
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Back to guests
        </Link>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          Add guest
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a contact for your show.
        </p>
      </div>

      <Card className="max-w-xl rounded-xl border-border">
        <CardHeader>
          <CardTitle>Guest details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createGuest} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required autoComplete="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" rows={4} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={3} />
            </div>
            <div className="flex gap-3">
              <Button type="submit">Save guest</Button>
              <Link
                href="/host/guests"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
