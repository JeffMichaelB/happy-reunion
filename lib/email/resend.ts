import { createHash } from "node:crypto"

import { Resend } from "resend"

const DEFAULT_FROM = "The Reunion Projects <onboarding@resend.dev>"

function getApiKey(): string | null {
  const key = process.env.RESEND_API_KEY?.trim()
  return key && key.length > 0 ? key : null
}

export function isEmailConfigured(): boolean {
  return getApiKey() !== null
}

function getFromAddress(): string {
  const from = process.env.RESEND_FROM_EMAIL?.trim()
  return from && from.length > 0 ? from : DEFAULT_FROM
}

export class EmailNotConfiguredError extends Error {
  constructor() {
    super(
      "Email is not configured. Add RESEND_API_KEY (and ideally RESEND_FROM_EMAIL) to enable sending.",
    )
    this.name = "EmailNotConfiguredError"
  }
}

type SendEmailInput = {
  to: string
  subject: string
  body: string
  /**
   * Stable identifier for the logical send (e.g. an episode id). Combined with
   * the message contents to build an idempotency key so an accidental retry
   * within 24h does not deliver a duplicate.
   */
  idempotencyScope: string
}

type SendEmailResult = {
  messageId: string | null
}

/**
 * Renders a plain-text body into a minimal branded HTML wrapper. Line breaks in
 * the source body become paragraph breaks.
 */
function renderHtml(subject: string, body: string): string {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map(
      (block) =>
        `<p style="margin:0 0 16px;line-height:1.6">${escapeHtml(block).replace(/\n/g, "<br />")}</p>`,
    )
    .join("")

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f6f6f6;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1c1c1c">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #ececec;border-radius:12px;padding:32px">
      <h1 style="margin:0 0 20px;font-size:18px;font-weight:600">${escapeHtml(subject)}</h1>
      ${paragraphs || `<p style="margin:0;line-height:1.6">${escapeHtml(body)}</p>`}
    </div>
  </body>
</html>`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export async function sendEmail({
  to,
  subject,
  body,
  idempotencyScope,
}: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new EmailNotConfiguredError()
  }

  const resend = new Resend(apiKey)

  const fingerprint = createHash("sha256")
    .update(`${to}\n${subject}\n${body}`)
    .digest("hex")
    .slice(0, 16)

  const { data, error } = await resend.emails.send(
    {
      from: getFromAddress(),
      to: [to],
      subject,
      html: renderHtml(subject, body),
      text: body,
    },
    { idempotencyKey: `episode-email/${idempotencyScope}/${fingerprint}` },
  )

  if (error) {
    throw new Error(error.message)
  }

  return { messageId: data?.id ?? null }
}
