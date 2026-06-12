# Deployment Checklist – מנהל.AI (Phase 7)

Read-only audit. No code changes were made as part of this phase. This document is the deployment runbook for taking the current codebase to production (Vercel + Supabase).

---

## 1. Required Environment Variables

These are the only variables referenced by the codebase (`grep -r "process.env"`).

| Variable | Required | Public/Secret | Used in | Notes |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Public (exposed to browser) | `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts` | Project URL from Supabase Settings → API. Safe to expose – it's the public API endpoint. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Public (exposed to browser) | same as above | The `anon` public key from Supabase Settings → API. Safe to expose – access is governed by RLS policies. |
| `AI_API_KEY` | **Optional** | Secret (server-only) | `app/api/ai/chat/route.ts` | Anthropic API key. **If unset, the AI Assistant automatically falls back to Demo Mode** (`lib/ai/demo-responses.ts`) and returns realistic canned Hebrew answers with `demo: true` — no error is shown to the user. Decide before launch whether real AI responses are required for production. |
| `AI_MODEL` | Optional | Secret (server-only) | `app/api/ai/chat/route.ts` | Defaults to `claude-sonnet-4-6` if unset. Only has effect when `AI_API_KEY` is set. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Not used** | Secret | — | Present in `.env.local` but **not referenced anywhere in the current codebase**. Not required for deployment today. Do **not** add `NEXT_PUBLIC_` prefix to it under any circumstances if it's added in the future — it must remain server-only. |

### Action items
- [ ] No `.env.example` / `.env.local.example` file currently exists in the repo, but `README.md` references `cp .env.local.example .env.local`. Create this file (separately from this checklist, since this phase is read-only) listing the four variables above (excluding the unused service role key, or including it with a "currently unused" comment).
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel Project Settings → Environment Variables, for **Production**, **Preview**, and **Development** environments.
- [ ] Decide on `AI_API_KEY` for production: set it for real AI responses, or deliberately leave unset for Demo Mode (acceptable for an MVP/demo launch — verify with the user that this is communicated to end users, per remaining-issue #14 in `PRODUCTION_READINESS_REPORT.md`).
- [ ] If `AI_API_KEY` is set, optionally set `AI_MODEL` (defaults to `claude-sonnet-4-6` otherwise).

---

## 2. Supabase Configuration

- Three Supabase clients are used:
  - `lib/supabase/client.ts` – browser client (uses `@supabase/ssr` `createBrowserClient`)
  - `lib/supabase/server.ts` – server-components client (cookie-based session)
  - `lib/supabase/middleware.ts` – edge middleware client, used by root `middleware.ts` for session refresh/auth-gating on every request (matcher excludes `_next/static`, `_next/image`, `favicon.ico`, and static image extensions)
- All three rely solely on `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Action items
- [ ] In the Supabase project: **Authentication → Providers**, confirm **Email** auth is enabled (per `README.md` setup instructions).
- [ ] **Authentication → URL Configuration**: set **Site URL** to the production domain (e.g. `https://<your-app>.vercel.app` or custom domain) and add it (plus any Vercel preview URL patterns, e.g. `https://*-<project>.vercel.app`) to **Redirect URLs**. This is required for email confirmation / password-reset links (`/forgot-password` flow) to redirect correctly in production.
- [ ] Confirm email templates (confirmation, password reset) are configured if using Supabase's built-in email sending, or that a custom SMTP provider is configured under **Authentication → Settings → SMTP** for production email volume (Supabase's default email sending is rate-limited and intended for development only).

---

## 3. Required Migrations

The canonical schema is `supabase/schema.sql` (340 lines) — it is **fully consolidated** and already includes everything from migrations `0002`–`0007` (4-state document status, notifications table + triggers, requests table with the restricted owner policies from `0007`, and all three storage buckets with policies).

### For a brand-new Supabase project (recommended path)
- [ ] Run **`supabase/schema.sql`** in the SQL Editor, once, in full. This single file creates: `profiles`, `documents`, `transactions`, `reminders`, `ai_messages`, `notifications`, `requests` tables; all RLS policies; the `handle_new_user` trigger (auto-creates a profile row on signup); the `requests` notification triggers; and the three storage buckets (`documents`, `avatars`, `students-documents`) with their policies.
- [ ] **Do not** additionally run `supabase/migrations/0002`–`0007` against a fresh project — they are redundant with (and in the case of `0002`, would error against) the consolidated schema, since `schema.sql` already reflects their end state.

### For an existing project created from an older version of `schema.sql`
There is no `0001_*.sql` file — the original/base schema is `schema.sql` itself as it existed at the time. If the project predates the 4-state document-status / notifications / requests features, run the following **in numeric order**:
- [ ] `supabase/migrations/0002_document_status_update.sql` — migrates `documents.status` from `pending|verified|rejected` to `received|in_review|needs_correction|approved` (data-preserving `update` + constraint swap).
- [ ] `supabase/migrations/0003_academic_documents_storage_policy.sql` — adds a temporary shared-read storage policy (superseded by 0004).
- [ ] `supabase/migrations/0004_students_documents_bucket.sql` — creates the public `students-documents` bucket and drops the policy from 0003.
- [ ] `supabase/migrations/0005_notifications.sql` — creates the `notifications` table + RLS + indexes.
- [ ] `supabase/migrations/0006_requests.sql` — creates the `requests` table + RLS + notification triggers.
- [ ] `supabase/migrations/0007_requests_restrict_update.sql` — replaces the permissive `requests_all_own` policy with separate select/insert/delete-only policies (security fix; prevents students from self-approving requests).

> **Note**: 0002 is destructive if re-run against a database that's already on the new status values (the `update ... case status` mapping would leave already-migrated rows unchanged due to the `else status` branch, so it is actually idempotent/safe to re-run — but verify current `documents.status` values before running on a production dataset with real data).

---

## 4. Required Storage Buckets

All three buckets are created and policy-configured by `schema.sql` (or by migrations `0002`–`0004` for legacy projects). No manual bucket creation is needed if `schema.sql` is run.

| Bucket | Public? | Purpose | Policies |
|---|---|---|---|
| `documents` | **Private** (`public = false`) | User-uploaded documents (`components/documents/upload-dialog.tsx`, accessed via `createSignedUrl` in `components/documents/documents-client.tsx`) | `documents_storage_select_own` / `_insert_own` / `_delete_own` — restricted to files under a folder named after `auth.uid()` |
| `avatars` | **Public** (`public = true`) | Profile photos (`components/profile/profile-form.tsx`) | `avatars_storage_select_all` (public read), `_insert_own` / `_update_own` (owner-only write, folder-scoped by `auth.uid()`) |
| `students-documents` | **Public** (`public = true`) | Static academic document templates served by the Documents Center (`lib/academic-documents.ts`, `lib/constants.ts` → `ACADEMIC_DOCUMENT_TYPES`) | `students_documents_storage_select_public` (public read for everyone) |

### Action items
- [ ] After running `schema.sql`, verify in **Storage** that all three buckets (`documents`, `avatars`, `students-documents`) exist with the correct public/private flags shown above.
- [ ] **Upload the 5 static PDF templates** referenced by `ACADEMIC_DOCUMENT_TYPES` in `lib/constants.ts` into the `students-documents` bucket, using these exact filenames (the app links directly to these paths):
  - `Ishor-lemodem.pdf`
  - `EXAMS.pdf`
  - `Grades.pdf`
  - `HOUR.pdf`
  - `Specail.pdf`
  - Without these files, the corresponding "Documents Center" cards will produce broken/404 public URLs.

---

## 5. Build Configuration

- `package.json` scripts: `dev` → `next dev`, `build` → `next build`, `start` → `next start`, `lint` → `eslint .`
- Confirmed working build command (used throughout this project's prior phases): `rm -rf .next && npm run build` → last verified result: **✓ Compiled successfully, 0 TypeScript errors, 17 routes generated**.
- `private: true` in `package.json` — fine for Vercel deployment (this only prevents accidental `npm publish`, it does not affect Vercel).
- Node version: not pinned via an `engines` field in `package.json` or a `.nvmrc`. Vercel will use its default Node version for the selected Next.js version (Next 15 requires Node ≥ 18.18). Recommended: add an `engines.node` field or `.nvmrc` to pin the version explicitly (not done here per "no code changes").

### Action items
- [ ] Optionally pin a Node version (e.g. Node 20) in Vercel Project Settings → General → Node.js Version, or via `.nvmrc` / `package.json` `engines` field in a future change.
- [ ] No build-time environment variables beyond the four listed in section 1 are required (verified via full-codebase `process.env` grep).

---

## 6. Next.js Configuration

`next.config.ts`:
```ts
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
};
```
- `images.remotePatterns` is already configured for `**.supabase.co`, which covers both the Supabase Storage public URLs (avatars, students-documents) and signed URLs (documents bucket) used with `next/image`. **No changes needed** — this will work against any Supabase project's default `*.supabase.co` hostname.
- If a **custom Supabase domain** is used instead of the default `*.supabase.co` hostname, `remotePatterns` would need to be updated (out of scope here — code change).
- No `output: "standalone"` or other custom output mode is set — default Next.js output is fully compatible with Vercel's build pipeline.
- `reactStrictMode: true` — no impact on production deployment, dev-only double-invocation behavior.

### Action items
- [ ] If the Supabase project URL ever changes to a custom domain (not `*.supabase.co`), `next.config.ts` `images.remotePatterns` must be updated in a follow-up code change — flag this now so it isn't missed later.

---

## 7. Security Settings

- `.gitignore` correctly excludes `.env`, `.env*.local`, and `.vercel` — confirmed no secrets are committed to the repo.
- `middleware.ts` (root) calls `updateSession()` from `lib/supabase/middleware.ts` on every matched request — this refreshes the auth session and is the mechanism that protects `(app)/*` routes. Matcher excludes static assets (`_next/static`, `_next/image`, `favicon.ico`, image extensions).
- All data tables (`profiles`, `documents`, `transactions`, `reminders`, `ai_messages`, `notifications`, `requests`) have **RLS enabled** with owner-scoped policies (`auth.uid() = user_id`) per `schema.sql`.
- `requests` table: as of migration `0007`, students can `select`/`insert`/`delete` their own requests but **cannot update** them — status changes require the service role (admin/staff tooling), preventing self-approval. Note: `SUPABASE_SERVICE_ROLE_KEY` is not currently used anywhere in the codebase, so **no admin tooling exists yet** to actually change request statuses. This is a functional gap (out of scope for this checklist) but worth flagging: requests will currently get stuck in `received` status indefinitely with no way to progress them, unless changed directly via the Supabase dashboard/SQL.
- AI API key (`AI_API_KEY`) is read server-side only (`app/api/ai/chat/route.ts`, `export const runtime = "nodejs"`) and never sent to the client — correct.
- `SUPABASE_SERVICE_ROLE_KEY` (present in `.env.local`, unused in code) — if it is ever wired up in the future, it must **never** be prefixed with `NEXT_PUBLIC_` and must only be read in server-side code (API routes / server actions), never in client components.

### Action items
- [ ] No secrets are committed — confirmed safe to push to a public or private remote.
- [ ] Before going live, decide how `requests` status transitions (`approved`/`rejected`/`document_required`) will be performed in practice (manual SQL via Supabase dashboard is the only current path) — this is a product/process decision, not a deployment blocker.

---

## 8. Missing Production Dependencies

Reviewed `package.json` dependencies against actual usage:
- All UI dependencies (`@radix-ui/*`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate`, `lucide-react`, `sonner`, `recharts`, `date-fns`, `zod`) are standard npm packages — no native binaries or platform-specific builds that would behave differently on Vercel vs. local.
- `@supabase/ssr` (^0.12.0) and `@supabase/supabase-js` (^2.49.1) are both present and are the correct packages for the three client constructors in use.
- No `.env`-dependent dependencies (e.g. no Redis, no external queue, no file-system-based caching) that would be unavailable in Vercel's serverless/edge environment.
- **Pre-existing Edge Runtime warning**: `lib/supabase/middleware.ts` runs in the Edge runtime (via root `middleware.ts`) and uses `@supabase/supabase-js`, which emits a build-time warning about Node.js API usage in Edge Runtime. This was present before Phase 6A/6B and **does not fail the build** — it is a known upstream warning with `@supabase/ssr` + Edge middleware and does not affect functionality on Vercel (Vercel's Edge Middleware runtime supports this pattern). No action required, but expect to see this warning in the Vercel build logs — it is not a regression.

### Action items
- [ ] No missing dependencies identified. `npm install` followed by `npm run build` is sufficient.
- [ ] Expect (and ignore) the `@supabase/supabase-js` Edge Runtime warning in build logs.

---

## 9. Vercel Compatibility

- Next.js 15.2.0 App Router with Server Components, Route Handlers (`app/api/ai/chat/route.ts`), and Edge Middleware — all natively supported by Vercel with zero configuration.
- No `vercel.json` exists in the repo — **none is required**. Default Vercel auto-detection of Next.js projects handles build command (`next build`), output directory, install command (`npm install`), and routing automatically.
- `app/api/ai/chat/route.ts` explicitly sets `export const runtime = "nodejs"` — this route will run as a Vercel Serverless Function (not Edge), which is correct since it makes an outbound `fetch` to `api.anthropic.com` with a secret API key (Node runtime keeps this off the Edge network and supports the full `fetch` + secret-env-var model needed here).
- Root `middleware.ts` runs on the Edge runtime by default (standard Next.js middleware) — compatible with Vercel Edge Middleware.

### Action items
- [ ] No `vercel.json` needed — rely on auto-detection.
- [ ] In Vercel: **Import Project** → connect the Git repository → framework preset will auto-detect "Next.js" → no build/output overrides needed.
- [ ] Add the environment variables from section 1 in **Project Settings → Environment Variables** before the first deploy (or the build/runtime will fail on `process.env.NEXT_PUBLIC_SUPABASE_URL!` non-null assertions in `lib/supabase/*.ts`, which will throw at request time if unset).

---

## 10. Public URL Readiness

- The app is fully RTL Hebrew (`<html lang="he" dir="rtl">`, Heebo font per `README.md`) — no locale/i18n routing concerns for a single-language deployment.
- Auth flows (`(auth)/login`, `register`, `forgot-password`) depend on Supabase **Redirect URLs** being configured for the production domain (see section 2) — without this, password-reset and email-confirmation links will redirect to `localhost` or fail.
- `next/image` remote patterns cover Supabase-hosted images — avatar and document preview images will load correctly once the production Supabase URL is set.
- AI Assistant: if deploying with `AI_API_KEY` unset, end users will see Demo Mode responses (`demo: true` flag returned by the API but not currently surfaced as a visible UI indicator — see remaining issue #14 in `PRODUCTION_READINESS_REPORT.md`). Decide before sharing the public URL whether this is acceptable or whether a "מצב הדגמה" badge should be added in a follow-up.

---

## Deployment Steps (Ordered Runbook)

1. **Supabase setup**
   1. Create a new Supabase project (or confirm the existing one is the intended production project).
   2. Run `supabase/schema.sql` in the SQL Editor (creates all tables, RLS policies, triggers, and storage buckets).
   3. Upload the 5 required PDFs to the `students-documents` bucket (see section 4).
   4. Enable Email auth under Authentication → Providers.
   5. Set Site URL + Redirect URLs under Authentication → URL Configuration to the production domain (placeholder until step 3 of Vercel setup gives you the final URL; update afterward if needed).
   6. Note the project's `Project URL` and `anon` `public` key from Settings → API.

2. **Vercel setup**
   1. Push the repository to GitHub/GitLab/Bitbucket (if not already).
   2. In Vercel, "Add New… → Project" and import the repository. Framework preset auto-detects Next.js — leave build/output settings at defaults.
   3. Add environment variables (Production + Preview):
      - `NEXT_PUBLIC_SUPABASE_URL`
      - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
      - `AI_API_KEY` (optional — omit for Demo Mode)
      - `AI_MODEL` (optional)
   4. Deploy.

3. **Post-deploy Supabase URL fix-up**
   1. Take the resulting Vercel production URL (and any custom domain) and add/update it in Supabase Authentication → URL Configuration (Site URL + Redirect URLs).

4. **Smoke test** — see checklist below.

---

## Post-Deployment Verification Checklist

- [ ] **Auth**: Register a new account → confirm a `profiles` row is auto-created (via `handle_new_user` trigger) → log in → log out.
- [ ] **Password reset**: Trigger "שכחתי סיסמה" flow, confirm the email link redirects to the production domain (not `localhost`).
- [ ] **Dashboard** (`/dashboard`): loads without errors, stat cards render, recent documents/AI promo sections render.
- [ ] **Documents** (`/documents`):
  - Academic Documents section: each of the 5 available document types' "הצג"/"הורד PDF" actions work (confirms `students-documents` bucket PDFs were uploaded correctly and bucket is public).
  - Upload a test document → confirm it appears with status "התקבל" and a delete-confirmation dialog works.
- [ ] **Finance** (`/finance`): tuition overview renders with seeded installments; "שלם עכשיו" payment flow completes; additional-charge buttons add a payable transaction.
- [ ] **Reminders** (`/reminders`): smart reminders section renders derived items; manual reminder create/complete/delete (with confirmation) works.
- [ ] **Requests** (`/requests`): submit a new request → confirm a corresponding row appears in `notifications` (via the `requests_after_insert` trigger) and shows up under `/notifications`.
- [ ] **Notifications** (`/notifications`): reachable from the sidebar/nav (added in Phase 6B); mark-as-read and mark-all-as-read work.
- [ ] **Profile** (`/profile`): avatar upload works and persists (confirms `avatars` bucket is public + policies correct).
- [ ] **AI Assistant** (`/ai-assistant`): send a message — confirm either a real AI response (if `AI_API_KEY` set) or a Demo Mode response (if unset), with no console errors.
- [ ] **Grades / Schedule / Exams**: pages load without errors (static demo data — no DB dependency).
- [ ] **Mobile**: spot-check `/dashboard`, `/documents`, `/finance` at a narrow viewport (per Phase 6B mobile review, no layout breakage expected).
- [ ] **Edge middleware**: confirm visiting `/dashboard` while logged out redirects to `/login`, and visiting `/login` while logged in redirects to `/dashboard` (standard Supabase SSR auth-gating behavior).
- [ ] **Build logs**: confirm the Vercel build completed with the expected `@supabase/supabase-js` Edge Runtime warning only (no new errors).
