# מנהל.AI

פלטפורמת SaaS לניהול אקדמי וכספי לסטודנטים - לוח בקרה, עוזר AI, מרכז מסמכים, מרכז כספים, תזכורות ופרופיל אישי.

## טכנולוגיות

- **Next.js 15** (App Router, Server Components)
- **React 19** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (Radix primitives)
- **Supabase** (Auth, Postgres, Storage, RLS)
- **Recharts** for data visualization
- RTL Hebrew UI (`<html lang="he" dir="rtl">`, Heebo font)

## התקנה

```bash
npm install
cp .env.local.example .env.local
```

עדכנו את `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
AI_API_KEY=...        # מפתח Anthropic API לעוזר ה-AI
AI_MODEL=claude-sonnet-4-6
```

> אם `AI_API_KEY` לא מוגדר, עוזר ה-AI עובר אוטומטית ל-**מצב הדגמה (Demo Mode)** ועונה
> תשובות מקומיות ריאליסטיות (אישורים, ציונים, מערכת שעות, חוב שכר לימוד ועוד) - מבלי
> להציג למשתמש שגיאת תצורה.

## הגדרת Supabase

1. צרו פרויקט חדש ב-[Supabase](https://supabase.com).
2. הריצו את הקובץ [`supabase/schema.sql`](supabase/schema.sql) ב-SQL Editor - הוא יוצר את כל הטבלאות, מדיניות ה-RLS, ה-trigger ליצירת פרופיל אוטומטי, ו-storage buckets (`documents`, `avatars`).
3. ודאו ש-Email auth מופעל תחת Authentication > Providers.

## הרצה

```bash
npm run dev
```

האפליקציה תרוץ ב-http://localhost:3000.

## מבנה הפרויקט

```
app/
  (auth)/login, register, forgot-password   - מסכי הזדהות
  (app)/dashboard, ai-assistant, documents,
        finance, reminders, profile         - מסכי האפליקציה (מאחורי middleware)
  api/ai/chat                               - API route לעוזר ה-AI
components/
  ui/        - shadcn/ui primitives
  layout/    - sidebar, header, ניווט
  dashboard/, documents/, finance/,
  reminders/, profile/, ai-assistant/, auth/
lib/
  supabase/  - client.ts (browser), server.ts (RSC), middleware.ts
  utils.ts, constants.ts
types/
  database.types.ts, index.ts
supabase/
  schema.sql - סכמת מסד הנתונים המלאה
```

## עיצוב

מצב בהיר בלבד, פלטת צבעים:

| Token | Value |
| --- | --- |
| Primary | `#4F46E5` |
| Background | `#F8FAFC` |
| Cards | `#FFFFFF` |
| Text | `#0F172A` |
| Borders | `#E5E7EB` |
