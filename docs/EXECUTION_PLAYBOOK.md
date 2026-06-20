# Execution Playbook — Cal.com API-Key Onboarding & Per-Host Sync

> **Authoritative handoff for the Cursor agent + the human running it.**
> This file contains: (A) how to run the agent, (B) the rules that must stay
> loaded every turn, (C) the phased implementation plan, (D) paste-ready kickoff
> prompts per phase. Pair this with `docs/BROWSER_TESTS.md` for end-to-end
> verification and `.cursor/rules/calcom.md` for always-on guardrails.

---

## A. How to run this (human instructions)

1. Confirm these files are in the repo:
   - `docs/EXECUTION_PLAYBOOK.md` (this file)
   - `docs/BROWSER_TESTS.md`
   - `.cursor/rules/calcom.md`
   - `supabase/migrations/20260614120000_calcom_apikey_hardening.sql`
2. Run the agent **one phase per instruction** using the kickoff prompts in
   section D. Do NOT say "implement the whole brief" — the agent will skip the
   verify gates.
3. After each phase, make the agent show evidence (MCP query output, curl
   result, `tsc` output) before you approve the next phase.
4. The agent will NOT reliably self-stop. You are the pacing mechanism.

---

## B. Rules that must hold every turn (mirror of .cursor/rules/calcom.md)

1. **API-key only. No OAuth.** Cal.com closed new Platform/OAuth signups
   (Dec 15 2025). Delete OAuth code; never re-add it.
2. **Per-host isolation is the core invariant.** Host A
   (`jstump@thereunionprojects.com`) must never see Host B's data. Enforced by
   RLS (`auth.uid() = host_id`), not just query filters.
3. **DESIGN.md governs all UI.** Cream `#f7f4ed`, charcoal `#1c1c1c`, Outfit for
   UI, Geist Mono for literal values (API key, booking URL). Border-forward
   depth; 6px button / 12px card radius; 9999px pills. Light theme only.
4. **Secrets encrypted at rest** via `encryptToken()` (AES-256-GCM). Never store
   plaintext; never expose to client components or `NEXT_PUBLIC_` vars.
5. **Free-tier webhook risk → polling fallback.** Don't block onboarding on
   webhook success. If `POST /v2/webhooks` 4xx, fall back to polling for that host.
6. **Stop at every ✅ VERIFY gate** and report evidence before continuing.
7. **If the brief conflicts with the codebase, STOP and ask.** Do not silently
   deviate.

### Guardrails — do NOT:
- Reintroduce Google / Workspace / OAuth.
- Add paid Cal.com tiers or the Platform managed-user SDK.
- Weaken or remove RLS policies.
- Move credential access off the service-role admin client.
- Put service role key / API keys / webhook secrets anywhere client-side.

---

## C. Tool routing

- **Supabase MCP** — apply migration; verify columns, indexes, RLS. Never
  hand-edit the DB.
- **GitHub** — branch `feat/calcom-apikey-onboarding`; commit per phase; PR at end.
- **Vercel** — verify env vars (below) across Production/Preview/Dev; after
  Phase 2 read runtime logs to confirm webhook delivery.
- **Cal.com docs** — https://cal.com/docs (v2, `cal-api-version` header) when
  unsure of an API shape. Do not invent fields.

Env vars (verify present; never print values):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY` (sensitive), `TOKEN_ENCRYPTION_KEY` (>=32 chars),
`NEXT_PUBLIC_SITE_URL`, `CALCOM_WEBHOOK_SECRET` (transitional; removed after Phase 2).

---

## D. Phased plan + kickoff prompts

### Phase 0 — Apply migration (Supabase MCP)
Files: `supabase/migrations/20260614120000_calcom_apikey_hardening.sql`

KICKOFF PROMPT:
> Read `docs/EXECUTION_PLAYBOOK.md` and `.cursor/rules/calcom.md`. Execute Phase 0
> ONLY. Apply the migration via Supabase MCP, then verify via MCP: column
> `webhook_secret_encrypted` exists on `host_calcom_credentials`; the OAuth
> columns are gone; indexes `bookings_calcom_uid_unique` and
> `guests_host_email_lower_unique` exist; RLS on `bookings`/`guests` with the
> `_select_own` policies; `host_calcom_credentials` has RLS enabled and no
> authenticated policies. Paste the MCP query results as evidence, commit
> "Phase 0", and STOP.

### Phase 1 + 2 — ATOMIC UNIT: per-host secret + handler
> MUST ship together. If registration writes a per-host secret but the handler
> still verifies against the global env secret (or vice versa), all webhooks fail
> signature checks silently and bookings stop with no surfaced error.

Files: `lib/calcom/api.ts`, `app/host/settings/actions.ts` (`selectEventType`),
`app/api/webhooks/calcom/route.ts`

Phase 1: generate `randomBytes(32).toString("hex")` per host at registration,
pass to `createWebhook`, store `webhook_secret_encrypted = encryptToken(secret)`
in the same credentials upsert as `webhook_id`. Stop using
`process.env.CALCOM_WEBHOOK_SECRET` for new registrations.

Phase 2 handler order: (1) parse `?slug=` → 400 if missing; (2) read raw body,
look up host by slug (admin client) → 404 if none; (3) load+decrypt that host's
`webhook_secret_encrypted`; (4) verify `x-cal-signature-256` = hex
HMAC-SHA256(secret, rawBody) with `timingSafeEqual` → 401 on mismatch;
(5) handle triggers — `BOOKING_CREATED`: `findOrCreateGuestId` then **UPSERT** on
`cal_com_booking_uid`, then Resend host notification; `BOOKING_RESCHEDULED`:
update by `(host_id, cal_com_booking_uid = rescheduleUid ?? uid)`, log if 0 rows;
`BOOKING_CANCELLED`: set status `cancelled` by `(host_id, uid)`; (6) 200 for
handled events, 4xx/5xx only for auth/parse failures.

KICKOFF PROMPT:
> Execute Phases 1 AND 2 together as one commit (they are an atomic unit per the
> playbook). Implement per-host secret generation/storage and the rewritten
> webhook handler exactly as specified. Then run the Phase 1+2 VERIFY checks from
> `docs/BROWSER_TESTS.md` section "Webhook signature & idempotency" (curl cases)
> and report results. Commit "Phase 1+2" and STOP. Do not start Phase 3.

### Phase 3 — Onboarding action + retire OAuth
Files: `app/host/settings/actions.ts`, `lib/calcom/api.ts`;
DELETE `lib/calcom/oauth.ts`, `app/api/calcom/connect/route.ts`,
`app/api/calcom/callback/route.ts`

- Remove OAuth branch from `getAuth()`; resolution = DB api_key → env api_key.
- Connect chain: `saveCalComApiKey` (verify `/me`, store encrypted) →
  `getEventTypes` → host selects → `selectEventType` (registers webhook w/
  per-host secret, derives + saves `cal_com_booking_url`).
- `isConnected` helper: api_key_encrypted present AND cal_com_booking_url set.
- Gate `app/host/layout.tsx`: not-connected hosts routed to onboarding; allow
  "I'll do this later" → dashboard with persistent connect banner.

KICKOFF PROMPT:
> Execute Phase 3 ONLY. Delete the OAuth lib + routes, simplify `getAuth()`, wire
> the onboarding server-action chain, add the `isConnected` gate. Run
> `npm run typecheck` and paste the clean result. Commit "Phase 3" and STOP.

### Phase 4 — Wizard UI + booking-link surfaces (DESIGN.md)
Files: new `app/host/onboarding/*` (or dialog); reuse
`app/host/dashboard/booking-link-banner.tsx`, `copy-link-button.tsx`,
`app/host/settings/page.tsx`

- 4-step wizard in DESIGN.md tokens (Outfit; Geist Mono for key + URL; cream
  surfaces; charcoal primary w/ inset shadow; 9999px copy pill): Welcome →
  open Cal.com (free, new tab) → find API key (Settings → Developer → API keys,
  name "Reunion", blank expiry, "starts with cal_") → paste/verify/pick event
  type → success showing real booking URL large w/ Copy + Share.
- Dashboard: persistent booking-link bar when connected.
- Settings: connection card (status, account, last sync, URL copy/open, Replace
  key / Disconnect). Auto-launch wizard on first login when not connected.

KICKOFF PROMPT:
> Execute Phase 4 ONLY. Build the wizard + booking-link surfaces strictly to
> DESIGN.md. Then run `docs/BROWSER_TESTS.md` section "Onboarding wizard (browser)"
> and paste results/screenshots. Commit "Phase 4" and STOP.

### Phase 5 — Isolation + free-tier webhook proof (+ polling fallback)
- Two-host isolation test (see browser tests).
- Free-account webhook proof. If webhook 4xx or no fire: implement polling —
  scheduled job (Vercel Cron → authed route) that for each host with a stored
  api_key and NULL webhook_id calls Cal.com bookings list and upserts on
  `cal_com_booking_uid` (same idempotent path). No UI change.

KICKOFF PROMPT:
> Execute Phase 5 ONLY. Run the full `docs/BROWSER_TESTS.md` suite end-to-end with
> the browser tool using two real test hosts. Paste every result. If the
> free-tier webhook test fails, implement the polling fallback as specified, then
> re-run the booking-sync tests. Commit "Phase 5", open the PR, and STOP.

---

## E. Definition of done
New host: signup → paste key → pick event type → unique booking URL → share →
guest books → booking appears under correct host within minutes →
reschedule/cancel reflected → host notified. Two hosts fully isolated.
No OAuth, no Google, no paid tiers. `npm run typecheck` clean. PR opened.
