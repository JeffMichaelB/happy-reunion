# Next.js template

This is a Next.js template with shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```

## Vercel

Linked team: **Jeffrey's projects** (`jeffreys-projects-1207f4a2`), project **`happy-reunion`**.

```bash
vercel link --yes --project happy-reunion --scope jeffreys-projects-1207f4a2
vercel env ls
vercel --prod --yes --scope jeffreys-projects-1207f4a2
```

**Already set in Vercel (Production, Preview, Development):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (points at Supabase project `happy-reunion-east` — see `supabase/README.md`).

**You still need to add:**

- `SUPABASE_SERVICE_ROLE_KEY` — Production, Preview, (optional) Development; mark sensitive.
- `CALCOM_WEBHOOK_SECRET` — same environments; the HMAC secret you configured in Cal.com webhooks.

Optional: `NEXT_PUBLIC_SITE_URL` = your canonical site URL (e.g. production `https://…vercel.app` or custom domain) for stable auth `redirectTo`.
