export type EmailTemplateKey = "prep" | "follow_up" | "recording_link"

export type EmailDraft = {
  subject: string
  body: string
}

export type EmailPreset = EmailDraft & {
  id: EmailTemplateKey
  label: string
  description: string
}

type EpisodeEmailContext = {
  guestName: string
  topic: string | null
  notes: string | null
  startsAt: string | null
  endsAt: string | null
  riversideUrl?: string | null
}

type GuestBookingContext = {
  guestName: string
  hostName: string | null
  topic: string | null
  startsAt: string | null
  endsAt: string | null
}

function formatWhen(startsAt: string | null, endsAt?: string | null): string {
  if (!startsAt) return "the scheduled time"

  const start = new Date(startsAt)
  if (Number.isNaN(start.getTime())) return "the scheduled time"

  const dateTime = start.toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  })

  if (!endsAt) return dateTime

  const end = new Date(endsAt)
  if (Number.isNaN(end.getTime())) return dateTime

  return `${dateTime} - ${end.toLocaleTimeString("en-US", { timeStyle: "short" })}`
}

function topicLine(topic: string | null): string | null {
  return topic ? `Topic: ${topic}` : null
}

export function buildGuestBookingConfirmationEmail({
  guestName,
  hostName,
  topic,
  startsAt,
  endsAt,
}: GuestBookingContext): EmailDraft {
  const hostLabel = hostName ?? "your host"
  const subject = topic
    ? `You're booked for The Reunion Projects: ${topic}`
    : "You're booked for The Reunion Projects"
  const lines = [
    `Hi ${guestName},`,
    "",
    `You're booked for a Reunion conversation with ${hostLabel}.`,
    "",
    `When: ${formatWhen(startsAt, endsAt)}`,
    topicLine(topic),
    "",
    "A few prompts to think through before the conversation:",
    "- What stories do you want future generations to remember?",
    "- Which people, places, or moments shaped this chapter?",
    "- Are there photos, letters, or keepsakes you may want nearby?",
    "",
    "We'll keep the conversation relaxed. Just bring yourself and a few memories.",
  ]

  return {
    subject,
    body: lines.filter((line) => line !== null).join("\n"),
  }
}

export function buildEpisodeEmailPresets({
  guestName,
  topic,
  notes,
  startsAt,
  endsAt,
  riversideUrl,
}: EpisodeEmailContext): EmailPreset[] {
  const subjectTopic = topic ? `: ${topic}` : ""
  const when = formatWhen(startsAt, endsAt)
  const prepNotes = notes?.trim()
  const recordingLine = riversideUrl
    ? `Recording link: ${riversideUrl}`
    : "Recording link: [paste recording link here]"

  return [
    {
      id: "prep",
      label: "Prep note",
      description:
        "Confirm the time and share prompts before the conversation.",
      subject: `Preparing for your Reunion${subjectTopic}`,
      body: [
        `Hi ${guestName},`,
        "",
        `I'm looking forward to our Reunion conversation on ${when}.`,
        topicLine(topic),
        prepNotes ? `Notes: ${prepNotes}` : null,
        "",
        "A few prompts you can think through beforehand:",
        "- What stories feel important to preserve?",
        "- Who or what shaped this part of your life?",
        "- Are there photos or keepsakes you want nearby?",
        "",
        "No need to prepare anything formal. These are just starting points.",
      ]
        .filter((line) => line !== null)
        .join("\n"),
    },
    {
      id: "follow_up",
      label: "Follow-up",
      description: "Thank the guest and recap next steps after recording.",
      subject: `Thank you for your Reunion${subjectTopic}`,
      body: [
        `Hi ${guestName},`,
        "",
        "Thank you again for sharing your stories with me.",
        topicLine(topic),
        "",
        "I'll review the conversation and follow up with any next steps.",
        "If anything else comes to mind, feel free to send it my way.",
      ]
        .filter((line) => line !== null)
        .join("\n"),
    },
    {
      id: "recording_link",
      label: "Recording link",
      description: "Send the guest a Riverside or recording link.",
      subject: `Your Reunion recording${subjectTopic}`,
      body: [
        `Hi ${guestName},`,
        "",
        "Here is the link for your Reunion recording:",
        recordingLine,
        "",
        "Thank you again for being part of this.",
      ].join("\n"),
    },
  ]
}
