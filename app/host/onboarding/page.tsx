import {
  ArrowRight,
  ArrowSquareOut,
  CheckCircle,
  Key,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"
import { redirect } from "next/navigation"

import { CopyLinkButton } from "@/app/host/dashboard/copy-link-button"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getEnvBookingUrl, getEventTypes, isConnected } from "@/lib/calcom/api"
import { createClient } from "@/lib/supabase/server"

import { chooseEventType, connectApiKey, finishOnboarding, skipOnboarding } from "./actions"
import { ShareLinkButton } from "./share-link-button"

const STEPS = ["Welcome", "Open Cal.com", "Find API key", "Connect"] as const

type Step = "welcome" | "open" | "key" | "event" | "done"

function stepIndex(step: Step): number {
  switch (step) {
    case "welcome":
      return 0
    case "open":
      return 1
    case "key":
      return 2
    case "event":
    case "done":
      return 3
    default: {
      const _exhaustive: never = step
      return _exhaustive
    }
  }
}

function ProgressDots({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Onboarding progress">
      {STEPS.map((label, i) => (
        <li key={label} className="flex items-center gap-2">
          <span
            aria-current={i === current ? "step" : undefined}
            className={
              i <= current
                ? "size-2 rounded-full bg-foreground"
                : "size-2 rounded-full bg-foreground/15"
            }
          />
        </li>
      ))}
    </ol>
  )
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; error?: string }>
}) {
  const { step: rawStep, error } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const step: Step = ((): Step => {
    switch (rawStep) {
      case "open":
      case "key":
      case "event":
      case "done":
        return rawStep
      default:
        return "welcome"
    }
  })()

  // If already fully connected and not on the done screen, jump to success so
  // hosts who revisit can grab their link rather than re-entering a key.
  const connected = await isConnected(user.id)
  if (connected && step !== "done") {
    redirect("/host/onboarding?step=done")
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 py-6">
      <div className="space-y-3">
        <ProgressDots current={stepIndex(step)} />
        <h1 className="text-4xl font-semibold tracking-tight">
          Connect Cal.com
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Guests book you through Cal.com, and those bookings sync straight into
          your dashboard. It takes about a minute.
        </p>
      </div>

      {step === "welcome" ? (
        <Card>
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-foreground/[0.04]">
              <Sparkle className="size-5" weight="regular" />
            </div>
            <CardTitle>Let&rsquo;s set up scheduling</CardTitle>
            <CardDescription>
              You&rsquo;ll create (or sign in to) a free Cal.com account, copy a
              personal API key, and paste it here. We&rsquo;ll handle the rest.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Link href="/host/onboarding?step=open">
              <Button>
                Get started
                <ArrowRight className="size-3.5" weight="bold" />
              </Button>
            </Link>
            <form action={skipOnboarding}>
              <Button type="submit" variant="ghost">
                I&rsquo;ll do this later
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {step === "open" ? (
        <Card>
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-foreground/[0.04]">
              <ArrowSquareOut className="size-5" weight="regular" />
            </div>
            <CardTitle>Open Cal.com</CardTitle>
            <CardDescription>
              Cal.com&rsquo;s free plan is all you need. Open it in a new tab,
              create an account if you don&rsquo;t have one, then come back here.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <a
              href="https://app.cal.com/signup"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary">
                <ArrowSquareOut className="size-3.5" weight="bold" />
                Open Cal.com
              </Button>
            </a>
            <Link href="/host/onboarding?step=key">
              <Button>
                Next
                <ArrowRight className="size-3.5" weight="bold" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {step === "key" ? (
        <Card>
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-foreground/[0.04]">
              <Key className="size-5" weight="regular" />
            </div>
            <CardTitle>Find and paste your API key</CardTitle>
            <CardDescription>
              In Cal.com, go to{" "}
              <span className="font-medium text-foreground">
                Settings → Developer → API keys
              </span>
              , create a key named &ldquo;Reunion&rdquo; with no expiration, and
              paste it below. It starts with{" "}
              <span className="font-mono">cal_</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <a
              href="https://app.cal.com/settings/developer/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm underline underline-offset-4"
            >
              <ArrowSquareOut className="size-3.5" weight="bold" />
              Open the API keys page
            </a>
            <form action={connectApiKey} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="api_key">Cal.com API key</Label>
                <Input
                  id="api_key"
                  name="api_key"
                  type="password"
                  placeholder="cal_live_…"
                  autoComplete="off"
                  spellCheck={false}
                  className="font-mono text-xs"
                  aria-invalid={error === "invalid" ? true : undefined}
                />
                {error === "invalid" ? (
                  <p className="text-sm text-destructive">
                    Cal.com rejected that key. Double-check you copied the whole
                    value from Settings → Developer → API keys.
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit">Verify &amp; connect</Button>
                <Link href="/host/onboarding?step=open">
                  <Button type="button" variant="ghost">
                    Back
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {step === "event" ? <EventStep userId={user.id} /> : null}

      {step === "done" ? <DoneStep userId={user.id} /> : null}
    </div>
  )
}

async function EventStep({ userId }: { userId: string }) {
  let eventTypes: Awaited<ReturnType<typeof getEventTypes>> = []
  try {
    eventTypes = await getEventTypes(userId)
  } catch {
    eventTypes = []
  }

  const selectClass =
    "border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm outline-none transition-[color,box-shadow] focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[rgba(59,130,246,0.5)] disabled:cursor-not-allowed disabled:opacity-50"

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-foreground/[0.04]">
          <CheckCircle className="size-5" weight="regular" />
        </div>
        <CardTitle>Pick your booking event type</CardTitle>
        <CardDescription>
          This is the event guests will book. We&rsquo;ll register a webhook so
          bookings sync automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {eventTypes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No event types found in your Cal.com account yet. Create one in
            Cal.com, then{" "}
            <Link
              href="/host/onboarding?step=event"
              className="underline underline-offset-4"
            >
              refresh
            </Link>
            .
          </p>
        ) : (
          <form action={chooseEventType} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="event_type_id">Event type</Label>
              <select
                id="event_type_id"
                name="event_type_id"
                defaultValue=""
                className={selectClass}
              >
                <option value="">Select an event type...</option>
                {eventTypes.map((et) => (
                  <option key={et.id} value={et.id}>
                    {et.title} ({et.length} min)
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit">
              Finish setup
              <ArrowRight className="size-3.5" weight="bold" />
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

async function DoneStep({ userId }: { userId: string }) {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("cal_com_booking_url")
    .eq("id", userId)
    .single()

  const bookingUrl = profile?.cal_com_booking_url ?? getEnvBookingUrl() ?? null

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-[#dcfce7]">
          <CheckCircle className="size-5 text-[#166534]" weight="fill" />
        </div>
        <CardTitle>You&rsquo;re all set</CardTitle>
        <CardDescription>
          Share your booking link with guests. New bookings will appear on your
          dashboard automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {bookingUrl ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Your booking link
              </p>
              <p className="rounded-md border border-border bg-background px-3 py-2 font-mono text-[15px] break-all">
                {bookingUrl}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CopyLinkButton link={bookingUrl} size="default" />
              <ShareLinkButton url={bookingUrl} />
              <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost">
                  <ArrowSquareOut className="size-3.5" weight="bold" />
                  Open
                </Button>
              </a>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Connected. Your booking link will appear once your event type is
            selected.
          </p>
        )}
        <form action={finishOnboarding}>
          <Button type="submit">
            Go to dashboard
            <ArrowRight className="size-3.5" weight="bold" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
