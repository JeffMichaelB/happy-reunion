# Browser & End-to-End Test Suite — Cal.com Onboarding & Per-Host Sync

> For the Cursor agent to run with a **real browser tool** (e.g. Playwright /
> Cursor browser) plus Supabase MCP (DB assertions) and curl (webhook auth).
> Run against a Vercel **preview** deploy, not production. Record pass/fail +
> evidence (screenshot path, MCP rows, HTTP status) for each step.

## Test accounts & prerequisites
- App users (Supabase email/password): `HOST_A` = jstump@thereunionprojects.com
  (existing), `HOST_B` = a fresh test signup (use a +alias email you control).
- Cal.com: each host needs their OWN **free** Cal.com account + a personal API
  key (Settings → Developer → API keys, blank expiry). HOST_B's account should be
  brand-new/free to validate the free-tier path.
- A throwaway "guest" email you can receive mail at, to act as the booker.
- `BASE_URL` = the preview deployment URL.

> NOTE: real third-party signups (Cal.com) and inbound email may need human help
> if they hit CAPTCHA/2FA. If the browser tool is blocked, pause and ask the
> human to complete that single step, then continue.

---

## SUITE 1 — Auth & gating (browser)
**1.1 Signup routes to onboarding**
- Browser: go to `BASE_URL/signup`, create HOST_B with email+password.
- EXPECT: after auth, HOST_B is taken to onboarding OR a dashboard showing a
  clear "not connected / connect your calendar" state (not a populated dashboard).
- Screenshot the state.

**1.2 Not-connected dashboard has no data**
- EXPECT: KPIs empty/zeroed, no guest rows, booking link absent or disabled.

**1.3 Skip is allowed**
- Click "I'll do this later".
- EXPECT: lands on dashboard with a persistent connect banner still visible.

---

## SUITE 2 — Onboarding wizard (browser)
**2.1 Wizard walkthrough**
- Launch wizard (auto or via "Finish setup").
- EXPECT 4 steps with progress indicator: Welcome → Open Cal.com → Find API key
  → Paste & verify. "Open Cal.com" links open in a new tab.

**2.2 Invalid key rejected**
- Paste `cal_invalid_xxx`. EXPECT inline error, no DB write (verify via MCP:
  `host_calcom_credentials` has no api_key for HOST_B).

**2.3 Valid key accepted + event-type pick**
- Paste HOST_B's real key → verify → select an event type.
- EXPECT success step shows the REAL booking URL large with Copy + Share.
- MCP VERIFY: `host_calcom_credentials` for HOST_B has `api_key_encrypted`,
  `webhook_id`, `webhook_secret_encrypted`, `selected_event_type_id`; and
  `profiles.cal_com_booking_url` is set.

**2.4 DESIGN.md compliance (visual)**
- Screenshot wizard + dashboard. EXPECT cream background `#f7f4ed`, charcoal
  text, Outfit headings, API key + URL rendered in Geist Mono, pill-shaped copy
  button, no dark mode. Flag any deviation.

**2.5 Booking link is prominent**
- EXPECT booking URL copyable from: finish step, dashboard booking-link bar,
  and Settings connection card. Test the Copy button actually copies.

---

## SUITE 3 — Webhook signature & idempotency (curl, no browser)
Run after Phase 1+2. Use HOST_B's slug.

**3.1 Missing slug → 400**
`curl -i -X POST "$BASE_URL/api/webhooks/calcom"` → EXPECT 400.

**3.2 Bad signature → 401**
`curl -i -X POST "$BASE_URL/api/webhooks/calcom?slug=<HOST_B_slug>" \
  -H "x-cal-signature-256: deadbeef" -H "content-type: application/json" \
  -d '{"triggerEvent":"BOOKING_CREATED","payload":{}}'` → EXPECT 401.

**3.3 Unknown slug → 404**
Same as 3.2 with `slug=does-not-exist` and (if you compute a valid sig you can't,
so) EXPECT 404 or 401 before any DB write. EXPECT no row created.

**3.4 Idempotent create**
- Trigger a real booking (Suite 4) OR replay an identical signed payload twice.
- MCP VERIFY: exactly ONE `bookings` row for that `cal_com_booking_uid` (the
  unique index + upsert prevents duplicates; handler must not 500 on the second).

---

## SUITE 4 — Guest booking → reactions (browser, the core flow)
**4.1 Guest books HOST_B**
- Browser (as the guest, ideally a separate context/incognito): open HOST_B's
  booking URL, pick an available slot, complete the booking with the guest email.
- EXPECT Cal.com confirmation screen.

**4.2 Booking appears under the RIGHT host within minutes**
- MCP VERIFY: a `bookings` row with `host_id = HOST_B`, correct `starts_at`,
  `guest_email`, `cal_com_booking_uid`, status `confirmed`; and a `guests` row
  for HOST_B with that email (no duplicate).
- Browser (as HOST_B): dashboard/guests now shows the new guest + upcoming
  booking. Screenshot.

**4.3 Notification fired**
- EXPECT HOST_B receives the Resend notification email (or the email_sends/log
  shows it). Confirm recipient is HOST_B, not the guest.

**4.4 Reschedule reflects**
- Browser (guest): use the Cal.com reschedule link to move the booking.
- MCP VERIFY: the SAME row updated (new `starts_at`), no duplicate row.
- Browser (HOST_B): dashboard shows updated time.

**4.5 Cancel reflects**
- Browser (guest): cancel via Cal.com link.
- MCP VERIFY: same row, status `cancelled`. Browser: HOST_B dashboard reflects it.

---

## SUITE 5 — Per-host isolation (the critical invariant)
**5.1 Connect HOST_A too**
- Browser (as HOST_A / jstump): complete onboarding with HOST_A's own Cal.com key.
- Have a (different) guest book HOST_A.

**5.2 Cross-host blindness (UI)**
- Browser (as HOST_A): guests/bookings show ONLY HOST_A's data — HOST_B's guest
  is absent. Then as HOST_B: only HOST_B's data, HOST_A's guest absent.
  Screenshot both.

**5.3 Cross-host blindness (RLS, not just UI)**
- Using an authenticated (anon-key + HOST_B session) Supabase query, attempt to
  select HOST_A's bookings by HOST_A's host_id.
- EXPECT zero rows (RLS blocks it). This proves isolation is structural, not a
  forgotten WHERE clause.

**5.4 Credentials never exposed**
- Attempt to read `host_calcom_credentials` as the authenticated (non-service)
  client. EXPECT zero rows / denied. Confirm no API key or webhook secret is ever
  sent to the browser (check network payloads on dashboard/settings).

---

## SUITE 6 — Free-tier webhook proof (gates polling fallback)
**6.1 Did HOST_B's webhook register?**
- MCP VERIFY: HOST_B `webhook_id` is non-null after Suite 2.3.
- If NULL or registration logged a 4xx → the free tier blocks webhook creation.

**6.2 Did it actually fire?**
- Suite 4.2 already proves firing. If 4.2 produced a row WITHOUT polling, webhooks
  work on free. If 4.2 produced NO row, webhooks don't fire on free.

**6.3 Fallback decision**
- If 6.1/6.2 show webhooks don't work on free: implement the polling fallback
  (Phase 5), then RE-RUN Suite 4.2/4.4/4.5. EXPECT same results via polling
  (allow a few minutes' delay). Confirm polling only runs for hosts with NULL
  webhook_id.

---

## Reporting format (per step)
`[suite.step] PASS/FAIL — evidence: <screenshot path | MCP rows | HTTP status> — notes`
End with a summary table and an explicit statement: "Per-host isolation verified:
YES/NO" and "Free-tier webhooks work: YES/NO (fallback active: YES/NO)".
