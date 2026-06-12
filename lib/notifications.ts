import type { SupabaseClient } from "@supabase/supabase-js";

import {
  DEMO_ASSIGNMENTS,
  DEMO_EXAMS,
  REGISTRATION_DEADLINE,
} from "@/lib/constants";
import { getTuitionTransactions, summarizeTuition } from "@/lib/tuition";
import type { DocumentRow, AppNotification, NotificationSeverity, Transaction } from "@/types";
import type { Database } from "@/types/database.types";

export const NOTIFICATION_SEVERITY_ORDER: Record<NotificationSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

export const NOTIFICATION_SEVERITY_STYLE: Record<NotificationSeverity, { bg: string; color: string; badge: "destructive" | "warning" | "secondary"; label: string }> = {
  critical: { bg: "#FEF2F2", color: "#EF4444", badge: "destructive", label: "קריטי" },
  warning: { bg: "#FFFBEB", color: "#D97706", badge: "warning", label: "אזהרה" },
  info: { bg: "#EEF2FF", color: "#4F46E5", badge: "secondary", label: "מידע" },
};

export type NotificationCandidate = Pick<
  AppNotification,
  "source_key" | "title" | "description" | "icon" | "severity" | "href" | "channel"
>;

interface BuildNotificationsInput {
  transactions: Transaction[];
  documents: DocumentRow[];
  now?: Date;
}

function daysUntil(dateStr: string, now: Date): number {
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function daysLabel(days: number): string {
  if (days <= 0) return "היום";
  if (days === 1) return "מחר";
  return `בעוד ${days} ימים`;
}

/**
 * Derives the current set of notification candidates from academic,
 * financial, and document state. Each candidate has a stable `source_key`
 * used to dedupe against already-persisted notifications, so read state is
 * preserved across regenerations.
 */
export function buildNotificationCandidates({
  transactions,
  documents,
  now = new Date(),
}: BuildNotificationsInput): NotificationCandidate[] {
  const candidates: NotificationCandidate[] = [];

  for (const exam of DEMO_EXAMS) {
    const days = daysUntil(exam.date, now);
    if (days >= 0 && days <= 3) {
      candidates.push({
        source_key: `exam-${exam.id}`,
        title: `מבחן ב${exam.course} ${daysLabel(days)}`,
        description: `${exam.date} בשעה ${exam.time}, ${exam.room}`,
        icon: "GraduationCap",
        severity: "warning",
        href: "/dashboard",
        channel: "in_app",
      });
    }
  }

  for (const assignment of DEMO_ASSIGNMENTS) {
    const days = daysUntil(assignment.dueDate, now);
    if (days >= 0 && days <= 1) {
      candidates.push({
        source_key: `assignment-${assignment.id}`,
        title: `מטלה ב${assignment.course} להגשה ${days === 0 ? "היום" : "מחר"}`,
        description: assignment.title,
        icon: "ClipboardList",
        severity: "critical",
        href: "/dashboard",
        channel: "in_app",
      });
    }
  }

  const tuitionSummary = summarizeTuition(getTuitionTransactions(transactions));
  if (tuitionSummary.nextInstallment) {
    const dueDate = tuitionSummary.nextInstallment.due_date;
    if (dueDate) {
      const days = daysUntil(dueDate, now);
      if (days >= 0 && days <= 7) {
        candidates.push({
          source_key: `tuition-${dueDate}`,
          title: `תשלום שכר לימוד ${daysLabel(days)}`,
          description: tuitionSummary.nextInstallment.title,
          icon: "Wallet",
          severity: "warning",
          href: "/finance",
          channel: "in_app",
        });
      }
    }
  }

  for (const doc of documents) {
    if (doc.status === "needs_correction") {
      candidates.push({
        source_key: `document-needs-correction-${doc.id}`,
        title: `מסמך "${doc.name}" נדחה ודורש תיקון`,
        description: "יש לתקן ולהעלות מחדש את המסמך",
        icon: "FileWarning",
        severity: "critical",
        href: "/documents",
        channel: "in_app",
      });
    } else if (doc.status === "approved") {
      candidates.push({
        source_key: `document-approved-${doc.id}`,
        title: `מסמך "${doc.name}" אושר`,
        description: "המסמך עבר בדיקה ואושר בהצלחה",
        icon: "FileCheck2",
        severity: "info",
        href: "/documents",
        channel: "in_app",
      });
    }
  }

  const registrationDays = daysUntil(REGISTRATION_DEADLINE, now);
  if (registrationDays >= 0 && registrationDays <= 3) {
    candidates.push({
      source_key: `registration-closing-${REGISTRATION_DEADLINE}`,
      title: `הרישום לקורסים עומד להיסגר ${daysLabel(registrationDays)}`,
      description: "ודאו שנרשמתם לכל הקורסים הנדרשים לסמסטר הבא",
      icon: "CalendarClock",
      severity: "warning",
      href: "/dashboard",
      channel: "in_app",
    });
  } else if (registrationDays > 3 && registrationDays <= 14) {
    candidates.push({
      source_key: `registration-opening-${REGISTRATION_DEADLINE}`,
      title: "הרישום לקורסים לסמסטר הבא ייפתח בקרוב",
      description: `המערכת תיפתח בעוד ${registrationDays} ימים`,
      icon: "CalendarClock",
      severity: "info",
      href: "/dashboard",
      channel: "in_app",
    });
  }

  return candidates;
}

/**
 * Inserts any new notification candidates for the user. Existing rows
 * (matched by `source_key`) are left untouched so read state persists.
 */
export async function syncNotifications(
  supabase: SupabaseClient<Database>,
  userId: string,
  candidates: NotificationCandidate[]
): Promise<void> {
  if (candidates.length === 0) return;

  const { data: existing } = await supabase
    .from("notifications")
    .select("source_key")
    .eq("user_id", userId);

  const existingKeys = new Set((existing ?? []).map((row) => row.source_key));
  const toInsert = candidates.filter((candidate) => !existingKeys.has(candidate.source_key));

  if (toInsert.length === 0) return;

  await supabase.from("notifications").insert(
    toInsert.map((candidate) => ({
      ...candidate,
      user_id: userId,
    }))
  );
}

export function sortNotifications(notifications: AppNotification[]): AppNotification[] {
  return [...notifications].sort((a, b) => {
    if (a.is_read !== b.is_read) return a.is_read ? 1 : -1;
    const severityDiff = NOTIFICATION_SEVERITY_ORDER[a.severity] - NOTIFICATION_SEVERITY_ORDER[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
