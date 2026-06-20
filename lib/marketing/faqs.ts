export type FaqCategory = "Hosting" | "Guesting" | "Privacy"

export interface Faq {
  question: string
  answer: string
  category: FaqCategory
}

export const FAQ_CATEGORIES: readonly FaqCategory[] = [
  "Hosting",
  "Guesting",
  "Privacy",
] as const

export const FAQS: readonly Faq[] = [
  {
    category: "Hosting",
    question: "Why would I want to become a host?",
    answer:
      "Hosting a Reunion is a meaningful way to reconnect with people who have shaped your life — and to create a record of those conversations worth keeping. As a host, you'll have access to:\n\n–  Reconnection with friends, acquaintances, and people from formative chapters of your life — high school, college, professional experiences, military service, and more.\n–  A full suite of tools to invite, schedule, record, store, and share your Reunions.\n–  Conversation resources to guide a rewarding, memorable Reunion for both you and your guests.",
  },
  {
    category: "Hosting",
    question: "How do I become a host?",
    answer:
      'Getting started is simple. Click "Host a Reunion," fill in a few basic details, and you\'re ready to go. From there, we provide everything you need — invitations, scheduling, recording, storage, and sharing — all in one place.',
  },
  {
    category: "Hosting",
    question: "Can I co-host a Reunion with someone else?",
    answer:
      "Yes — you're welcome to host with as many co-hosts as you'd like. That said, we recommend keeping it to 1–3 hosts per Reunion. Too many voices in the host role can shift the dynamic and make it harder to create the focused, genuine connection that makes Reunions special.",
  },
  {
    category: "Hosting",
    question: "What are the ground rules for a Reunion?",
    answer:
      "Reunions are a space for honest, respectful conversation — not a trip back to old dynamics or an opportunity for anyone to be put on the spot. A few principles guide every Reunion:\n\n–  This isn't about revisiting old roles, power dynamics, or inside jokes at someone's expense.\n–  No bullying, roasting, or \"gotcha\" moments — ever.\n–  The guest always decides what's on- or off-limits. Their comfort sets the boundaries.\n–  Politics, past relationships, and old escapades are off the table — unless the guest specifically wants to go there.\n–  You don't need to be funny or impressive. Just be present. That's enough.",
  },
  {
    category: "Hosting",
    question: "Is there a time limit for a Reunion?",
    answer:
      "Reunions are scheduled for one hour — long enough for depth, short enough to leave everyone wanting more.",
  },
  {
    category: "Privacy",
    question: "Can I share my Reunion on a podcast platform?",
    answer:
      "While Reunions aren't designed as podcasts, we understand they have a similar feel. Your Reunion is yours to share however you choose — as long as both the host and the guest mutually agree to make it public. Always get consent before distributing.",
  },
  {
    category: "Guesting",
    question: "I've been invited as a guest. How should I prepare?",
    answer:
      "You'll receive a preparatory email from your host with full instructions. Here's a preview of what to expect:\n\nBefore the Reunion, set aside 10–15 quiet minutes to reflect on a few prompts. There are no right answers — just honest ones. Jot down notes, bullet points, or half-formed thoughts. Whatever comes naturally is exactly right.\n\nA few reflection prompts to get you started:\n\n–  What turned out very differently than you expected?\n–  What decision mattered more than you realized at the time?\n–  What are you more confident about now — and what are you less sure of?\n–  What feels beautifully unfinished?\n\nThese prompts are a starting point, not a script. The conversation will find its own rhythm.\n\nIf there are topics you'd like to explore — or subjects you'd prefer to avoid — simply let your host know ahead of time. This is your conversation too.",
  },
  {
    category: "Guesting",
    question: "Why am I being asked to nominate the next guest?",
    answer:
      "We believe the best Reunions spark more Reunions. Passing the torch — nominating the next guest — keeps the momentum alive and creates a meaningful thread of connection from one conversation to the next.\n\nAs a bonus: when you nominate someone, you're also invited to join as a guest host for their Reunion. It's a great way to stay in the conversation.",
  },
  {
    category: "Privacy",
    question: "I'm a guest and I'm concerned about my Reunion being shared publicly?",
    answer:
      "Your privacy is foundational. No Reunion is ever shared publicly without the explicit, mutual consent of both the host and the guest. You are always in control of what happens with your conversation. If you'd prefer it stays private, it stays private — no questions asked.",
  },
] as const

export const MARKETING_NAV_LINKS = [
  { href: "/manifesto", label: "Manifesto" },
  { href: "/ground-rules", label: "Ground Rules" },
  { href: "/faqs", label: "FAQs" },
] as const
