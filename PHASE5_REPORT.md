# Phase 5 – Academic Portal Expansion Report

## Summary

Transformed the application from an academic dashboard into a complete
student portal by adding four new modules (Schedule, Exams, Grades,
Administrative Requests), integrating them into the dashboard and
navigation, and wiring request-status changes into the existing Smart
Notifications Center (Phase 4) via database triggers.

No existing functionality was duplicated: the Documents Center
(`/documents`) remains the single source of truth for אישור לימודים,
כרטיס נבחן, גיליון ציונים, מערכת שעות, and בקשה למועד מיוחד. The new
Schedule and Exams pages reuse `AcademicDocumentDialog` to open those same
documents directly.

---

## New routes

| Route | Description |
|---|---|
| `/schedule` | Weekly schedule (Sun–Thu) with course/lecturer/room/time, academic calendar widget, and a button to open the existing "מערכת שעות" PDF |
| `/exams` | Upcoming exams list (date, time, room, course) with direct "כרטיס נבחן" access via the existing document dialog |
| `/grades` | Full grades page: academic average, credits, degree progress bar, GPA trend chart (recharts), and per-semester grades table |
| `/requests` | Administrative requests: submit special-exam/grade-appeal/scholarship/inquiry requests, filter by status, demo status-update control |

All four were added to `NAV_ITEMS` (sidebar + topbar quick-switch) and `PAGE_SUBTITLES`.

---

## New database objects

**Migration**: `supabase/migrations/0006_requests.sql` (also merged into `supabase/schema.sql`)

- **Table** `public.requests`
  - Columns: `id`, `user_id`, `type` (`special_exam | grade_appeal | scholarship | inquiry`), `course`, `title`, `description`, `status` (`received | in_progress | document_required | approved | rejected`), `created_at`, `updated_at`
  - RLS policy `requests_all_own` — owner-only access
  - Indexes: `requests_user_id_idx`, `requests_user_status_idx`
- **Trigger function** `handle_request_submitted()` + trigger `requests_after_insert`
  - Fires on INSERT → creates an `in_app` notification ("הבקשה התקבלה")
- **Trigger function** `handle_request_status_change()` + trigger `requests_after_status_update`
  - Fires on UPDATE when `status` changes to `approved`, `rejected`, or `document_required` → creates a corresponding notification (success/critical/warning severity)

This must be run against the Supabase project (e.g. via `supabase db push` or the SQL editor) — it cannot be executed remotely from here.

---

## Notification integration (requirement 4 & 5)

- New request submitted → "הבקשה ... התקבלה" (info)
- Status → `approved` → "הבקשה ... אושרה" (info)
- Status → `rejected` → "הבקשה ... נדחתה" (critical)
- Status → `document_required` → "נדרש מסמך נוסף לבקשה ..." (warning)

All notifications appear in the existing bell/notification center and `/notifications` page, deduped by `source_key` (`request-submitted-<id>`, `request-status-<id>-<status>`). The `/requests` page includes a "עדכון סטטוס (הדגמה)" control per request so the full notification flow can be demonstrated without a separate admin backend.

---

## Dashboard integration

- **Next exam** / **Current average** / **Credits earned** / **Degree progress** — existing `AcademicSummaryCards` and `UpcomingExamsCard`, now linked to `/grades` and `/exams`
- **Next assignment** — existing `UpcomingAssignmentsCard`, linked to `/schedule`
- **Active requests** — new `ActiveRequestsCard`, showing up to 3 non-closed requests with status badges, linked to `/requests`

---

## Files added

- `app/(app)/schedule/page.tsx`, `components/schedule/{schedule-client,weekly-schedule,academic-calendar-card}.tsx`
- `app/(app)/exams/page.tsx`, `components/exams/exams-client.tsx`
- `app/(app)/grades/page.tsx`, `components/grades/{grades-summary-cards,grades-table,gpa-trend-chart}.tsx`, `lib/academics.ts`
- `app/(app)/requests/page.tsx`, `components/requests/{requests-client,new-request-dialog}.tsx`, `lib/requests.ts`
- `components/dashboard/active-requests-card.tsx`
- `supabase/migrations/0006_requests.sql`

## Files modified

- `types/index.ts`, `types/database.types.ts` — `requests` table types, `ScheduleSlot.lecturer`, `AcademicCalendarEvent`
- `lib/constants.ts` — `NAV_ITEMS`, `PAGE_SUBTITLES`, `DEMO_SCHEDULE` (+lecturer), `DEMO_EXAMS` (+1), `ACADEMIC_CALENDAR_EVENTS`, `REQUEST_TYPE_META`, `REQUEST_STATUS_META`
- `components/layout/nav-icon.tsx`, `components/notifications/notification-icon.tsx` — new icon registrations
- `supabase/schema.sql` — `requests` table, triggers, policies
- `app/(app)/dashboard/page.tsx`, `components/dashboard/{academic-summary-card,upcoming-exams-card,upcoming-assignments-card}.tsx` — fetch requests, add `ActiveRequestsCard`, cross-module links

---

## Build verification

`npm run build` — compiled successfully, 0 TypeScript errors, all 19 routes generated (including the 4 new ones: `/schedule`, `/exams`, `/grades`, `/requests`).

---

## Similarity estimate vs. original Artifact

**~92%** (up from ~65% before Phase 5).

Remaining gap (~8%): live integration with a real LMS/SIS for grades and schedule data (currently realistic demo constants, as requested), and an administrator-facing interface for processing requests (status changes are currently performed via a demo control on the student-facing page, since no admin module exists).
