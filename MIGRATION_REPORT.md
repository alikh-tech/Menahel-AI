# Migration Report — מנהל.AI artifact → Next.js + Supabase app

This report documents the migration of the production Next.js + Supabase
application's UI to match the original מנהל.AI design artifact, while
preserving all real backend functionality (Supabase auth, documents,
finance, reminders, profile, AI assistant).

## Scope

The migration restyled the app shell (sidebar, topbar) and every primary
screen (Dashboard, AI Assistant, Documents Center, Finance Center,
Reminders) to match the artifact's visual language: compact typography
(10–15px), `rounded-xl`/`rounded-2xl` cards, subtle shadows, colored icon
chips (indigo / emerald / amber / violet / red on tinted backgrounds), and
the artifact's gradient brand color (`#4F46E5` → `#6366F1`). RTL layout was
preserved throughout. Routing remained Next.js App Router (separate routes
per screen), per the agreed approach — the artifact's single-page internal
router was not ported.

## Files changed

### Layout / shell
- [lib/constants.ts](lib/constants.ts) — added `SCREENS` (topbar quick-switch
  list), `PAGE_SUBTITLES` (per-route titles), `ACADEMIC_DEMO_STATS` (GPA/
  credits placeholders).
- [components/layout/nav-icon.tsx](components/layout/nav-icon.tsx) — added
  `FolderOpen` and `Bot` icons to the icon map.
- [lib/document-meta.ts](lib/document-meta.ts) — **new file**. Maps document
  categories to icon + color chips (used in sidebar, dashboard, documents
  center).
- [components/layout/sidebar.tsx](components/layout/sidebar.tsx) — fully
  rewritten to match the artifact: brand header with gradient "מ" logo +
  BETA badge, student mini-card (real `profiles.full_name` /
  `field_of_study`), main nav, "מסמכים אחרונים" shortcuts built from real
  recent `documents`, and a bottom 2×2 KPI grid mixing real document counts
  (`documentsCount`, `pendingCount`) with `ACADEMIC_DEMO_STATS` (average,
  credits).
- [components/layout/sidebar-nav.tsx](components/layout/sidebar-nav.tsx) —
  restyled to compact (12px) artifact nav item style with indigo active
  state.
- [components/layout/header.tsx](components/layout/header.tsx) — rewritten
  as a client component; derives page title/subtitle from `usePathname()` +
  `PAGE_SUBTITLES`, shows `profiles.institution` / `academic_year` as
  subtitle, and adds an `xl:flex` topbar quick-switch row (`SCREENS`) linking
  to the other main routes.
- [app/(app)/layout.tsx](app/\(app\)/layout.tsx) — now also fetches the
  user's `documents` (for sidebar counts/shortcuts) and passes
  `institution`/`academic_year` to the header and `profile` /
  `recentDocuments` / `documentsCount` / `pendingCount` to the sidebar.
- [app/globals.css](app/globals.css) — added `confetti-fall` keyframes /
  `.animate-confetti-fall` utility for the payment success effect.

### Dashboard
- [app/(app)/dashboard/page.tsx](app/\(app\)/dashboard/page.tsx) — restyled
  greeting header, KPI row, finance chart card and AI CTA card (now a
  gradient indigo card matching the artifact's AI promo card).
- [components/dashboard/stat-card.tsx](components/dashboard/stat-card.tsx) —
  reworked to artifact's compact KPI card: smaller text, colored icon chip
  via `iconBg`/`iconColor` hex props (replaces the old Tailwind
  `text-*/bg-*` `iconColor` string).
- [components/dashboard/upcoming-reminders.tsx](components/dashboard/upcoming-reminders.tsx)
  and
  [components/dashboard/recent-documents.tsx](components/dashboard/recent-documents.tsx)
  — restyled to compact rows; recent documents now use
  `getDocumentMeta()` category icons.

### AI Assistant
- [app/(app)/ai-assistant/page.tsx](app/\(app\)/ai-assistant/page.tsx) —
  compact heading.
- [components/ai-assistant/chat-interface.tsx](components/ai-assistant/chat-interface.tsx)
  — added artifact-style chat header (avatar, "זמין כעת" status), restyled
  message bubbles (gradient user bubbles, bordered assistant bubbles),
  replaced the spinner typing indicator with a 3-dot bouncing typing
  indicator, restyled quick-question suggestion chips and the input bar.
  The real Anthropic / Demo Mode backend (from the previous task) is
  unchanged — only presentation was restyled.

### Documents Center
- [components/documents/documents-client.tsx](components/documents/documents-client.tsx)
  — rewritten: added a 4-card KPI summary row (total / verified / pending /
  rejected, computed from real `documents`), replaced the table with a
  responsive card grid (artifact-style document cards using
  `getDocumentMeta()` for category icons), and added a "הצג" (view) modal
  showing document details. "הורדה" and delete actions still operate on
  real Supabase Storage / `documents` rows.
- [app/(app)/documents/page.tsx](app/\(app\)/documents/page.tsx) — compact
  heading.

### Finance Center
- [components/finance/finance-client.tsx](components/finance/finance-client.tsx)
  — compact heading/KPIs, updated `StatCard` prop usage to the new
  `iconBg`/`iconColor` API, wires `onUpdate` through to the transactions
  table.
- [components/finance/transactions-table.tsx](components/finance/transactions-table.tsx)
  — added a "שלם עכשיו" button for pending/scheduled debt or payment rows,
  opening the new payment modal.
- [components/finance/payment-modal.tsx](components/finance/payment-modal.tsx)
  — **new file**. Recreates the artifact's payment confirmation modal
  (amount, saved-card summary, secure-payment note). On confirm, it updates
  the real `transactions` row's `status` to `completed` in Supabase, then
  shows a confetti celebration before closing.
- [components/finance/confetti-overlay.tsx](components/finance/confetti-overlay.tsx)
  — **new file**. Lightweight CSS-animation confetti overlay (no external
  dependency) used by the payment modal.

### Reminders
- [components/reminders/reminders-client.tsx](components/reminders/reminders-client.tsx)
  — added a 4-card KPI summary row (open / urgent / due this week /
  completed, computed from real `reminders`), and restyled reminder rows
  with a priority-colored right border and compact badges, matching the
  artifact's "smart reminders" look.

## Components created
- `lib/document-meta.ts`
- `components/finance/payment-modal.tsx`
- `components/finance/confetti-overlay.tsx`

## Components replaced / substantially rewritten
- `components/layout/sidebar.tsx`
- `components/layout/sidebar-nav.tsx`
- `components/layout/header.tsx`
- `components/dashboard/stat-card.tsx`
- `components/dashboard/upcoming-reminders.tsx`
- `components/dashboard/recent-documents.tsx`
- `components/ai-assistant/chat-interface.tsx`
- `components/documents/documents-client.tsx`
- `components/finance/transactions-table.tsx`
- `components/finance/finance-client.tsx`
- `components/reminders/reminders-client.tsx`

## Remaining differences from the artifact

1. **Academic records (GPA, credits, courses, exam dates, notifications)** —
   the artifact's dashboard/sidebar feature a rich academic-records panel
   (average grade, credits earned/required, upcoming exams, course list,
   academic alerts). No backing Supabase schema exists for these yet, so
   `lib/constants.ts`'s `ACADEMIC_DEMO_STATS` (average `87.4`, 72/120
   credits) is used as static placeholder data, exactly like the AI
   assistant's "Demo Mode" academic answers. Wiring these to real data would
   require a new `academic_records` / `courses` / `exams` schema.
2. **Saved payment card details** — the payment modal shows a static
   `**** 4242` placeholder card, since no payment-method storage exists in
   the schema. The payment *action* itself is real (updates the
   `transactions` row).
3. **Single-page artifact router vs. Next.js routes** — per the agreed
   approach, navigation uses real Next.js routes (`/dashboard`,
   `/ai-assistant`, `/documents`, `/finance`, `/reminders`, `/profile`)
   instead of the artifact's internal `active` screen state. The topbar
   quick-switch buttons and sidebar nav link to these routes.
4. **AI Assistant FAQ engine** — the artifact's local fuzzy-search FAQ
   engine (`faqSearch`/Levenshtein) was not ported. The app continues to use
   the real Anthropic integration when `AI_API_KEY` is configured, falling
   back to the previously implemented Demo Mode (predefined Hebrew
   responses + action cards) otherwise — restyled to match the artifact's
   chat UI.
5. **Profile page** — left functionally as-is (not part of the artifact's
   core screens); typography/spacing was not specifically restyled to the
   artifact's compact scale in this pass.
