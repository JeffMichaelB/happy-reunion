import { NextResponse, type NextRequest } from "next/server"

import { getGmailClient } from "@/lib/google/client"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

interface SendEmailBody {
  to: string
  subject: string
  body: string
  templateId?: string
  episodeId?: string
  variables?: Record<string, string>
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const payload = (await request.json()) as SendEmailBody
  let { to, subject, body: bodyText } = payload
  const { templateId, episodeId, variables } = payload

  if (!to) {
    return NextResponse.json({ error: "Recipient (to) is required" }, { status: 400 })
  }

  const admin = createAdminClient()

  if (templateId) {
    const { data: template } = await admin
      .from("email_templates")
      .select("subject, body")
      .eq("id", templateId)
      .eq("host_id", user.id)
      .single()

    if (template) {
      subject = template.subject
      bodyText = template.body
    }
  }

  if (variables && subject && bodyText) {
    for (const [key, value] of Object.entries(variables)) {
      const token = `{{${key}}}`
      subject = subject.replaceAll(token, value)
      bodyText = bodyText.replaceAll(token, value)
    }
  }

  if (!subject || !bodyText) {
    return NextResponse.json({ error: "subject and body are required" }, { status: 400 })
  }

  try {
    const gmail = await getGmailClient(user.id)
    const profile = await gmail.users.getProfile({ userId: "me" })
    const fromEmail = profile.data.emailAddress ?? user.email

    const raw = buildRfc2822({
      from: fromEmail ?? "",
      to,
      subject,
      body: bodyText,
    })

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    })

    await admin.from("email_sends").insert({
      host_id: user.id,
      recipient_email: to,
      subject,
      gmail_message_id: res.data.id ?? null,
      template_id: templateId ?? null,
      episode_id: episodeId ?? null,
    })

    return NextResponse.json({ ok: true, messageId: res.data.id })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Gmail send error"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

function buildRfc2822(params: {
  from: string
  to: string
  subject: string
  body: string
}): string {
  const lines = [
    `From: ${params.from}`,
    `To: ${params.to}`,
    `Subject: ${params.subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    params.body,
  ]
  const message = lines.join("\r\n")
  return Buffer.from(message).toString("base64url")
}
