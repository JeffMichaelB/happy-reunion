import { createHash } from "node:crypto"

import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/database.types"

type EmailSendPurpose =
  | "manual"
  | "host_booking_notification"
  | "guest_booking_confirmation"
  | "host_booking_rescheduled"
  | "guest_booking_rescheduled"
  | "host_booking_cancelled"
  | "guest_booking_cancelled"

type LogEmailSendInput = {
  hostId: string
  episodeId?: string | null
  recipientEmail: string
  subject: string
  body: string
  purpose: EmailSendPurpose
  providerMessageId?: string | null
}

function bodyPreview(body: string): string {
  return body.replace(/\s+/g, " ").trim().slice(0, 240)
}

function bodyHash(body: string): string {
  return createHash("sha256").update(body).digest("hex")
}

export async function logEmailSend(
  client: SupabaseClient<Database>,
  {
    hostId,
    episodeId = null,
    recipientEmail,
    subject,
    body,
    purpose,
    providerMessageId = null,
  }: LogEmailSendInput
) {
  return client.from("email_sends").insert({
    host_id: hostId,
    episode_id: episodeId,
    recipient_email: recipientEmail,
    subject,
    purpose,
    provider_message_id: providerMessageId,
    gmail_message_id: providerMessageId,
    body_preview: bodyPreview(body),
    body_hash: bodyHash(body),
  })
}
