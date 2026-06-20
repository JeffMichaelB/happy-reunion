---
description: Cal.com onboarding & per-host sync — always-on guardrails
alwaysApply: true
---

# Always-on rules for the Cal.com / podcast-scheduling work

These constraints hold on EVERY turn. The full plan is in
`docs/EXECUTION_PLAYBOOK.md`; the test suite is `docs/BROWSER_TESTS.md`.

## Hard constraints
- **API-key only. No OAuth.** Cal.com closed new Platform/OAuth signups
  (Dec 15 2025). Never add or restore OAuth.
- **Per-host isolation is the core invariant.** One host must never read
  another host's guests/bookings/calendar/credentials. Enforce via RLS
  (`auth.uid() = host_id`), not just query filters.
- **DESIGN.md governs UI.** Cream `#f7f4ed`, charcoal `#1c1c1c`, Outfit (UI),
  Geist Mono (literal values: API key, booking URL). Border-forward depth;
  6px button / 12px card radius; 9999px pills. Light theme only.
- **Encrypt secrets at rest** with `encryptToken()` (AES-256-GCM). Never store
  plaintext; never expose secrets to client components or `NEXT_PUBLIC_` vars.
- **Credential access is service-role only** via `createAdminClient()`.

## Do NOT
- Reintroduce Google / Workspace / OAuth.
- Add paid Cal.com tiers or the Platform managed-user SDK.
- Weaken or remove RLS policies.
- Block onboarding on webhook success (free-tier webhooks may fail → polling).

## Behavior
- Execute the playbook PHASE BY PHASE. Stop at each ✅ VERIFY gate and report
  evidence (MCP output / curl / typecheck) before continuing.
- Phases 1 and 2 are an ATOMIC UNIT — ship together or webhooks fail silently.
- If anything in the plan conflicts with the actual codebase, STOP and ask.
  Do not silently deviate.
- Use Supabase MCP for all DB changes/verification; never hand-edit the DB.
