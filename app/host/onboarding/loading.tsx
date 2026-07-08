import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function OnboardingLoading() {
  return (
    <div className="mx-auto max-w-lg space-y-8 py-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2" aria-hidden="true">
          <span className="size-2 rounded-full bg-foreground" />
          <span className="size-2 rounded-full bg-foreground/15" />
          <span className="size-2 rounded-full bg-foreground/15" />
          <span className="size-2 rounded-full bg-foreground/15" />
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">
          Connect Cal.com
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Loading your setup guide...
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="mb-2 size-10 animate-pulse rounded-lg bg-foreground/[0.04]" />
          <CardTitle>Preparing onboarding</CardTitle>
          <CardDescription>
            We&apos;re checking your account and Cal.com connection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-9 w-36 animate-pulse rounded-md bg-foreground/10" />
        </CardContent>
      </Card>
    </div>
  )
}
