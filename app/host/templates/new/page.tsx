import Link from "next/link"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import { createTemplate } from "../actions"

const TOKENS = [
  "guest_name",
  "guest_email",
  "date",
  "time",
  "topic",
  "host_name",
  "show_name",
  "riverside_url",
  "scheduling_link",
]

export default function NewTemplatePage() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <Link
          href="/host/templates"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          &larr; Back
        </Link>
        <h1 className="text-4xl font-semibold tracking-tight">
          New Template
        </h1>
      </div>

      <form action={createTemplate} className="mt-10 max-w-2xl space-y-6">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-medium">
              Template Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template name</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="e.g. Booking Confirmation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject line</Label>
              <Input
                id="subject"
                name="subject"
                required
                placeholder='e.g. You&apos;re confirmed for {{show_name}}'
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                name="body"
                required
                rows={12}
                placeholder="Hi {{guest_name}},&#10;&#10;You're confirmed for..."
              />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Available Tokens
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {TOKENS.map((token) => (
                  <code
                    key={token}
                    className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]"
                  >
                    {`{{${token}}}`}
                  </code>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit">Create template</Button>
          <Link
            href="/host/templates"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
