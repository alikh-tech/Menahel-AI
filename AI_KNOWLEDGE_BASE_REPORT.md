# AI Knowledge Base Implementation Report

Replaces the previous ad-hoc `getDemoResponse()` keyword chain with a structured, searchable FAQ knowledge base used as the Demo Mode fallback for the AI Assistant.

---

## 1. Files

| File | Status | Purpose |
|---|---|---|
| [lib/ai/knowledge-base.ts](lib/ai/knowledge-base.ts) | **New** | `FAQEntry` type, `KNOWLEDGE_BASE` array (61 entries), `findFAQAnswer()` matcher, `NO_MATCH_RESPONSE` constant |
| [lib/ai/demo-responses.ts](lib/ai/demo-responses.ts) | **Deleted** | Old 10-pattern keyword chain (`getDemoResponse`) — fully superseded |
| [app/api/ai/chat/route.ts](app/api/ai/chat/route.ts) | **Modified** | Demo-mode branch now calls `findFAQAnswer()` instead of `getDemoResponse()` |

---

## 2. Number of FAQ entries

**61 entries** in `KNOWLEDGE_BASE` (requirement was ≥50), grouped into 9 categories:

| Category | Entries |
|---|---|
| מסמכים אקדמיים (Academic documents) | 10 |
| ציונים ולימודים (Grades & studies) | 8 |
| מערכת שעות (Schedule) | 6 |
| מבחנים (Exams) | 6 |
| שכר לימוד וכספים (Tuition & finance) | 10 |
| בקשות מנהלתיות (Administrative requests) | 6 |
| תזכורות (Reminders) | 5 |
| פרופיל וחשבון (Profile & account) | 4 |
| כללי (General/platform) | 6 |
| **Total** | **61** |

All 11 answers from the original `demo-responses.ts` (10 keyword patterns + default) were preserved and migrated into the corresponding entries (e.g. `doc-study-confirmation`, `grades-average`, `grades-credits`, `finance-tuition-debt`, `exams-next`, `general-academic-summary`, etc.), with their original `DOCUMENT_ACTIONS` (הצג/הורד/שלח למייל) kept on the document-related entries. The old `DEFAULT_RESPONSE` is now replaced by the required `NO_MATCH_RESPONSE`.

---

## 3. Matching strategy (`findFAQAnswer`, in [lib/ai/knowledge-base.ts](lib/ai/knowledge-base.ts))

A scoring-based matcher is run over all 61 entries; the highest-scoring entry above a threshold (`MATCH_THRESHOLD = 2`) wins:

1. **Exact match** (+100) — the normalized user message equals an entry's normalized `question`.
2. **Substring match** (+10) — the normalized message contains the entry's `question`, or vice versa (handles phrasing like "תוכל בבקשה לתת לי אישור לימודים?").
3. **Keyword match** (+5 per hit) — any of the entry's `keywords[]` appears as a substring of the message (e.g. "חוב שכר לימוד", "מערכת שעות", "תזכורות חכמות").
4. **Partial / token-overlap match** (+1 per shared word) — the message and the entry's `question + keywords` are tokenized into words; shared tokens (after stripping common Hebrew prefix letters ב/כ/ל/מ/ה/ו/ש via `HEBREW_PREFIX_RE`, e.g. "לשכר" → "שכר", "במערכת" → "מערכת") add to the score, so differently-phrased questions still match.

**Hebrew support**: `normalize()` lowercases, strips Hebrew/English punctuation (quotes, גרשיים, `?!.,;:()`), and collapses whitespace before any comparison; `tokenize()` additionally strips the one/two-letter Hebrew prefix particles so inflected forms match their root word.

**No-match fallback**: if no entry reaches the threshold, the API returns:
> "לא מצאתי תשובה במאגר הידע. ניתן לפנות למזכירות המכללה."

(exported as `NO_MATCH_RESPONSE`, used verbatim by [app/api/ai/chat/route.ts](app/api/ai/chat/route.ts)).

---

## 4. Integration with `app/api/ai/chat/route.ts`

```ts
if (!apiKey) {
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  const match = findFAQAnswer(lastUserMessage?.content ?? "");

  return NextResponse.json(
    match
      ? { content: match.answer, actions: match.actions, demo: true }
      : { content: NO_MATCH_RESPONSE, demo: true },
    { status: 200 }
  );
}
```

- The flow is unchanged: auth check → message validation → `AI_API_KEY` check.
- **If `AI_API_KEY` is unset** (current state — `.env.local` has `AI_API_KEY=`): the last user message is run through `findFAQAnswer()`. A match returns its stored `answer` (+ `actions` if defined); no match returns `NO_MATCH_RESPONSE`. Both return `200` with `demo: true`, same as before.
- **If `AI_API_KEY` is set**: the Anthropic Messages API path (`fetch("https://api.anthropic.com/v1/messages", ...)`, `SYSTEM_PROMPT`, `AI_MODEL`, error handling) is **completely unchanged** — requirement 6 satisfied.

The existing suggestion chips in [components/ai-assistant/chat-interface.tsx](components/ai-assistant/chat-interface.tsx) ("תן לי אישור לימודים", "מה הממוצע שלי?", "האם יש לי חוב שכר לימוד?", "מתי המבחן הקרוב שלי?") all exact-match entries in the new knowledge base, so existing UI behavior is preserved.

---

## 5. Build Verification

`rm -rf .next && npm run build` → **✓ Compiled successfully, 0 TypeScript errors**, all 17 routes generated (including `/api/ai/chat` and `/ai-assistant`).

> Note: this Next.js 16.2.9/Turbopack build environment has a **pre-existing flaky issue** (unrelated to this change, also observed before this session's edits): the "Collecting page data using 15 workers" step occasionally throws `PageNotFoundError: Cannot find module for page: /<random-route>` due to a parallel-worker race condition on Windows. This is intermittent and resolves on retry (or deterministically with `experimental.cpus: 1`, used here only to confirm the build is otherwise clean — not committed, since it's outside this task's scope). `npx tsc --noEmit` passes with zero errors.

---

## 6. Spot-check examples (matcher behavior)

| User message | Matched entry | Why |
|---|---|---|
| "מה הממוצע שלי?" | `grades-average` | Exact match (after punctuation strip) |
| "תוכל לתת לי בבקשה אישור לימודים" | `doc-study-confirmation` | Substring match on "אישור לימודים" |
| "יש לי חוב בשכר הלימוד?" | `finance-tuition-debt` | Keyword "שכר לימוד" + token overlap on "חוב"/"לימוד" (after prefix-stripping "בשכר" → "שכר") |
| "מה יש בתפריט אוכל" (unrelated/off-topic) | none | Score below threshold → `NO_MATCH_RESPONSE` |
