"use client"

import { useFormStatus } from "react-dom"

import { sendEpisodeEmail } from "@/app/host/episodes/actions"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Sending…" : "Send email"}
    </Button>
  )
}

export function SendEmailForm({
  episodeId,
  to,
  defaultSubject,
  defaultBody,
  gmailUrl,
  emailConfigured,
}: {
  episodeId: string
  to: string
  defaultSubject: string
  defaultBody: string
  gmailUrl: string
  emailConfigured: boolean
}) {
  return (
    <form action={sendEpisodeEmail} className="space-y-4">
      <input type="hidden" name="id" value={episodeId} />
      <input type="hidden" name="to" value={to} />

      <div className="grid gap-2">
        <Label htmlFor="email-to">To</Label>
        <Input id="email-to" value={to} readOnly className="font-mono text-[13px]" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email-subject">Subject</Label>
        <Input id="email-subject" name="subject" defaultValue={defaultSubject} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email-body">Message</Label>
        <Textarea
          id="email-body"
          name="body"
          defaultValue={defaultBody}
          className="min-h-40"
        />
      </div>

      {!emailConfigured ? (
        <p className="text-xs text-muted-foreground">
          Sending is not configured yet. Add{" "}
          <span className="font-mono">RESEND_API_KEY</span> to send from the
          dashboard, or use Gmail below.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <SubmitButton disabled={!emailConfigured} />
        <a
          href={gmailUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Open in Gmail
        </a>
      </div>
    </form>
  )
}
