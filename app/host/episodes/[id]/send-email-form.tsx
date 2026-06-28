"use client"

import { useMemo, useState } from "react"
import { useFormStatus } from "react-dom"

import { sendEpisodeEmail } from "@/app/host/episodes/actions"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { EmailPreset } from "@/lib/email/templates"
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
  presets,
  emailConfigured,
}: {
  episodeId: string
  to: string
  presets: EmailPreset[]
  emailConfigured: boolean
}) {
  const initialPreset = presets[0]
  const [selectedPresetId, setSelectedPresetId] = useState(
    initialPreset?.id ?? ""
  )
  const [subject, setSubject] = useState(initialPreset?.subject ?? "")
  const [body, setBody] = useState(initialPreset?.body ?? "")

  const selectedPreset = presets.find(
    (preset) => preset.id === selectedPresetId
  )
  const gmailUrl = useMemo(() => {
    const p = new URLSearchParams({
      view: "cm",
      fs: "1",
      to,
      su: subject,
      body,
    })
    return `https://mail.google.com/mail/?${p.toString()}`
  }, [body, subject, to])

  function selectPreset(id: string) {
    const preset = presets.find((candidate) => candidate.id === id)
    if (!preset) return
    setSelectedPresetId(preset.id)
    setSubject(preset.subject)
    setBody(preset.body)
  }

  return (
    <form action={sendEpisodeEmail} className="space-y-4">
      <input type="hidden" name="id" value={episodeId} />
      <input type="hidden" name="to" value={to} />

      <div className="grid gap-2">
        <Label htmlFor="email-preset">Template</Label>
        <Select value={selectedPresetId} onValueChange={selectPreset}>
          <SelectTrigger id="email-preset" className="w-full sm:w-80">
            <SelectValue placeholder="Choose a template" />
          </SelectTrigger>
          <SelectContent>
            {presets.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedPreset ? (
          <p className="text-xs text-muted-foreground">
            {selectedPreset.description}
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email-to">To</Label>
        <Input
          id="email-to"
          value={to}
          readOnly
          className="font-mono text-[13px]"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email-subject">Subject</Label>
        <Input
          id="email-subject"
          name="subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email-body">Message</Label>
        <Textarea
          id="email-body"
          name="body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
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
