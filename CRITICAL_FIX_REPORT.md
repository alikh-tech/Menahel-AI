# Phase 6A – Critical Fix Report

Scope: only the **Critical** issues (C1-C4) from `FINAL_AUDIT_REPORT.md`, prioritized as:
1. Security vulnerabilities
2. Profile-related crashes
3. Data consistency problems
4. Architecture issues causing conflicting academic data

No styling, animation, accessibility, mobile, or new-feature work was performed.

---

## Issues Fixed

### 1. C1 — Students could change their own request status (security)

**Problem:** The `/requests` page had a "עדכון סטטוס (הדגמה)" dropdown that let any student set their own request's `status` directly (including to `approved`/`rejected`), which would also fire the Phase 5 notification triggers — i.e. a student could self-approve a scholarship/grade-appeal request and get a real "approved" notification.

**Fix:**
- Removed the status-update `Select` control, `handleStatusChange`, and now-unused imports from [components/requests/requests-client.tsx](components/requests/requests-client.tsx). Each request card now only displays its current status as a read-only badge.
- Added [supabase/migrations/0007_requests_restrict_update.sql](supabase/migrations/0007_requests_restrict_update.sql), which drops the old `requests_all_own` ("for all") policy and replaces it with separate `select`/`insert`/`delete` policies for the owner — **no `update` policy remains for authenticated users**. Status changes are now only possible via the service role (admin/staff tooling), which bypasses RLS.
- Mirrored the same policy change in [supabase/schema.sql](supabase/schema.sql) for fresh installs.

**Note:** This migration must be run against the Supabase project (`supabase db push` or SQL editor) — it cannot be executed remotely from here.

---

### 2. C2 — `.single()` profile fetches crashed for users without a profile row

**Problem:** `app/(app)/documents/page.tsx`, `app/(app)/schedule/page.tsx`, and `app/(app)/exams/page.tsx` fetched the user's `profiles` row with `.single()` and passed `profile!` to client components. Any account without a `profiles` row (new signups, trigger lag, manual seeding gaps) would error/crash on these three routes.

**Fix:**
- Changed all three fetches to `.maybeSingle()`.
- Added a new shared [components/shared/profile-required-card.tsx](components/shared/profile-required-card.tsx) — a simple "complete your profile" card with a link to `/profile`.
- Each of the three pages now renders `ProfileRequiredCard` instead of crashing when `profile` is `null`, and only passes a guaranteed non-null `profile` to `DocumentsClient` / `ScheduleClient` / `ExamsClient`.

---

### 3. C3/H1 — `ACADEMIC_DEMO_STATS` was mathematically inconsistent with `DEMO_COURSES`

**Problem:** `ACADEMIC_DEMO_STATS` (`average: "87.4"`, `creditsEarned: 72`) was a hand-written constant that did not match the actual `DEMO_COURSES` list (25 total credits, weighted average ≈ 87.6). The dashboard, profile page, and `/grades` page would show "72/120 credits, 87.4 average" while the grades table and GPA chart (built from `DEMO_COURSES`) showed a completely different picture — a glaring data-consistency issue for any pilot with real users.

**Fix:**
- Added `computeAcademicStats()` to [lib/academics.ts](lib/academics.ts), which derives `average`, `creditsEarned`, and `activeCourses` directly from `DEMO_COURSES` (credit-weighted average, summed credits, course count). `creditsRequired` (120) remains a constant — it represents the degree requirement, not something derivable from a course list.
- Removed `ACADEMIC_DEMO_STATS` entirely from [lib/constants.ts](lib/constants.ts).
- Updated all 5 consumers to call `computeAcademicStats()` instead:
  - [components/dashboard/academic-summary-card.tsx](components/dashboard/academic-summary-card.tsx)
  - [components/grades/grades-summary-cards.tsx](components/grades/grades-summary-cards.tsx)
  - [app/(app)/grades/page.tsx](app/(app)/grades/page.tsx)
  - [components/layout/sidebar.tsx](components/layout/sidebar.tsx)
  - [components/profile/profile-form.tsx](components/profile/profile-form.tsx)

Now the dashboard, sidebar, profile page, and grades page all show the same average/credits, computed from the same `DEMO_COURSES` list that backs the grades table and GPA trend chart.

---

### 4. C4 — "שלח למייל" claimed an email was sent when nothing was sent

**Problem:** `handleEmail()` in [components/documents/academic-document-dialog.tsx](components/documents/academic-document-dialog.tsx) generated a signed URL and then showed `toast.success("נשלח לכתובת ${profile.email}")` — implying a real email had been delivered, when no email-sending backend exists. This is especially risky for official academic documents (אישור לימודים, כרטיס נבחן, etc.) where a user might assume the document was forwarded somewhere.

**Fix:**
- Replaced `handleEmail()` with an honest message, consistent with the existing "demo mode" pattern already used in the AI Assistant (`components/ai-assistant/chat-interface.tsx`): `toast.info("שליחה במייל אינה זמינה כרגע - ניתן להוריד את המסמך ולשלוח אותו באופן עצמאי")`.
- Removed the now-unused `sendingEmail` loading state, `getAcademicDocumentEmailAttachmentUrl` import, and the unused `profile` destructure (the prop remains in the component's type signature for callers, but is no longer read inside the dialog).

---

## Build Verification

```
rm -rf .next && npm run build
```

Result: **✓ Compiled successfully**, 0 TypeScript errors, all 19 routes generated (including `/schedule`, `/exams`, `/grades`, `/requests`, `/documents`). The pre-existing Edge Runtime warning from `@supabase/supabase-js` (via `lib/supabase/middleware.ts`) is unrelated to this change and was present before Phase 6A.

---

## Remaining High Priority Issues (not addressed in this phase)

1. **No error handling around Supabase writes** in Requests, Profile, Documents, Finance (`new-request-dialog.tsx`, `profile-form.tsx`, `upload-dialog.tsx`, `finance-client.tsx`) — silent failures on insert/update.
2. **Schedule, Exams, and Grades show purely static demo data** with no per-user variation (`DEMO_SCHEDULE`, `DEMO_EXAMS`, `DEMO_COURSES`) — every account looks identical. (Architectural decision needed: build real `schedule`/`exams`/`course_grades` tables vs. explicitly label as sample data.)
3. **Transactions table is not usable on mobile** (`components/finance/transactions-table.tsx`) — no responsive card fallback.
4. **Destructive actions have no confirmation dialogs** — delete document, delete transaction, delete reminder.
5. **Document delete can orphan storage objects vs. DB rows** (`components/documents/documents-client.tsx`).
6. **`/notifications` page is unreachable from primary navigation** (`NAV_ITEMS`/`SCREENS` in `lib/constants.ts`) despite being fully built with Phase 5 request notifications.
7. **AI Assistant demo-mode is indistinguishable from real responses** when `AI_API_KEY` is unset (`app/api/ai/chat/route.ts`).
8. **Profile null-guard missing inside `ProfileForm`** itself — now mitigated at the page level for Documents/Schedule/Exams (C2), but `app/(app)/profile/page.tsx` and other consumers of a possibly-null profile should be reviewed for the same pattern.
9. **Header user-menu trigger and notification bell lack accessible names** (`components/layout/header.tsx`, `components/notifications/notification-bell.tsx`).

## Remaining Medium Priority Issues (not addressed in this phase)

1. Reminder "complete" toggle is an unlabeled custom control (`components/reminders/reminders-client.tsx`).
2. Icon-only action buttons across Documents/Finance lack `aria-label`.
3. Preview/download flows have silent failure paths (`documents-client.tsx`, `academic-documents-section.tsx`).
4. Finance tuition-seeding effect has only a `ref`-based idempotency guard — possible duplicate rows across tabs (`finance-client.tsx`).
5. Payment modal doesn't offer retry after a failed payment (`payment-modal.tsx`).
6. Notification read-state can desync from DB on error (`notifications-client.tsx`).
7. Grades table / schedule cards: minor RTL/responsive polish gaps (missing `scope="col"`, fixed padding).
8. Leftover demo-only copy in Smart Reminders empty state (`smart-reminders.tsx`).
9. "Settings" menu item points to `/profile` instead of a dedicated settings page (`header.tsx`).
10. AI Assistant suggestion buttons missing `type="button"`.
11. Chat/viewport height assumptions on mobile (`chat-interface.tsx`, `100vh` vs `100dvh`).

These remain as documented in `FINAL_AUDIT_REPORT.md` and are candidates for a future Phase 6B/6C pass.
