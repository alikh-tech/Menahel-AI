import type { SupabaseClient } from "@supabase/supabase-js";

import { computeAcademicStats } from "@/lib/academics";
import { getActiveRequests } from "@/lib/requests";
import { getTuitionTransactions, summarizeTuition, type TuitionSummary } from "@/lib/tuition";
import { DEMO_COURSES, DEMO_EXAMS } from "@/lib/constants";
import type { Database } from "@/types/database.types";
import type { AdminRequest, ExamItem, Transaction } from "@/types";
import type { FAQDataKey } from "@/lib/ai/knowledge-base";

export interface UserAcademicContext {
  average: string;
  creditsEarned: number;
  creditsRequired: number;
  creditsPercent: number;
  tuition: TuitionSummary;
  pendingDocumentsCount: number;
  openRequestsCount: number;
  nextExam: ExamItem | null;
}

/**
 * Fetches the requesting user's real portal data and combines it with the
 * shared academic/exam constants, reusing the same helpers/queries as the
 * dashboard so figures never disagree.
 */
export async function getUserAcademicContext(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UserAcademicContext> {
  const [{ data: documents }, { data: requests }, { data: transactions }] = await Promise.all([
    supabase.from("documents").select("*").eq("user_id", userId),
    supabase.from("requests").select("*").eq("user_id", userId),
    supabase.from("transactions").select("*").eq("user_id", userId),
  ]);

  const academic = computeAcademicStats(DEMO_COURSES);
  const tuition = summarizeTuition(getTuitionTransactions((transactions ?? []) as Transaction[]));

  const pendingDocumentsCount = (documents ?? []).filter(
    (doc) => doc.status === "received" || doc.status === "in_review"
  ).length;

  const openRequestsCount = getActiveRequests((requests ?? []) as AdminRequest[]).length;

  const today = new Date().toISOString().slice(0, 10);
  const nextExam =
    [...DEMO_EXAMS]
      .filter((exam) => exam.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;

  return {
    average: academic.average,
    creditsEarned: academic.creditsEarned,
    creditsRequired: academic.creditsRequired,
    creditsPercent: Math.round((academic.creditsEarned / academic.creditsRequired) * 100),
    tuition,
    pendingDocumentsCount,
    openRequestsCount,
    nextExam,
  };
}

function daysUntil(dateStr: string): number {
  const target = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/** Builds a personalized Hebrew answer for the given FAQ data key from real user data. */
export function formatPersonalizedAnswer(dataKey: FAQDataKey, ctx: UserAcademicContext): string {
  switch (dataKey) {
    case "average":
      return `הממוצע המשוקלל הנוכחי שלך עומד על ${ctx.average}, על סמך כל הקורסים שהושלמו עד כה.`;

    case "credits":
      return `צברת עד כה ${ctx.creditsEarned} מתוך ${ctx.creditsRequired} נקודות הזכות הנדרשות להשלמת התואר - כלומר כ-${ctx.creditsPercent}% מהדרישות.`;

    case "tuitionStatus": {
      const { total, paid, remaining, nextInstallment } = ctx.tuition;
      if (remaining <= 0) {
        return `שכר הלימוד שלך משולם במלואו (${paid} מתוך ${total} ₪). אין יתרת חוב פתוחה.`;
      }
      const nextLine = nextInstallment
        ? ` התשלום הבא בסך ${nextInstallment.amount} ₪ נקבע ל-${nextInstallment.due_date ?? "מועד שיעודכן"}.`
        : "";
      return `נכון להיום שילמת ${paid} מתוך ${total} ₪, ונותרה יתרת חוב של ${remaining} ₪.${nextLine} ניתן לעקוב אחרי כל החיובים והתשלומים במרכז הכספים.`;
    }

    case "nextExam": {
      if (!ctx.nextExam) {
        return 'אין לך כרגע מבחנים קרובים מתוכננים. ניתן לראות את לוח המבחנים המלא בעמוד "מבחנים".';
      }
      const days = daysUntil(ctx.nextExam.date);
      const when = days <= 0 ? "היום" : days === 1 ? "מחר" : `בעוד ${days} ימים`;
      return `המבחן הקרוב שלך הוא במקצוע "${ctx.nextExam.course}", ${when}, בשעה ${ctx.nextExam.time}, ב${ctx.nextExam.room}. מומלץ להתחיל בחזרות מוקדם.`;
    }

    case "openRequests":
      return ctx.openRequestsCount > 0
        ? `יש לך כרגע ${ctx.openRequestsCount} בקשות פתוחות (בסטטוס "התקבל", "בטיפול" או "נדרש מסמך"). ניתן לראות את הפירוט המלא בעמוד "בקשות".`
        : 'אין לך כעת בקשות פתוחות. ניתן להגיש בקשה חדשה בעמוד "בקשות".';

    case "pendingDocuments":
      return ctx.pendingDocumentsCount > 0
        ? `יש לך כרגע ${ctx.pendingDocumentsCount} מסמכים שמחכים לטיפול (בסטטוס "התקבל" או "בבדיקה"). ניתן לעקוב אחרי הסטטוס המעודכן במרכז המסמכים.`
        : "אין לך כעת מסמכים שמחכים לאישור. כל המסמכים שהעלית טופלו.";
  }
}
