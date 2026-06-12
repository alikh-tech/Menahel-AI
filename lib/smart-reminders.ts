import {
  DEMO_ASSIGNMENTS,
  DEMO_EXAMS,
  REGISTRATION_DEADLINE,
} from "@/lib/constants";
import { getTuitionTransactions, summarizeTuition } from "@/lib/tuition";
import type { DocumentRow, SmartReminder, Transaction } from "@/types";

interface GenerateSmartRemindersInput {
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

export function generateSmartReminders({ transactions, documents, now = new Date() }: GenerateSmartRemindersInput): SmartReminder[] {
  const reminders: SmartReminder[] = [];

  for (const exam of DEMO_EXAMS) {
    const days = daysUntil(exam.date, now);
    if (days >= 0 && days <= 3) {
      reminders.push({
        id: `exam-${exam.id}`,
        title: `מבחן ב${exam.course} בעוד ${days === 0 ? "היום" : days === 1 ? "יום" : `${days} ימים`}`,
        description: `${exam.date} בשעה ${exam.time}, ${exam.room}`,
        icon: "GraduationCap",
        severity: days <= 1 ? "urgent" : "warning",
        href: "/documents",
      });
    }
  }

  for (const assignment of DEMO_ASSIGNMENTS) {
    const days = daysUntil(assignment.dueDate, now);
    if (days >= 0 && days <= 2) {
      reminders.push({
        id: `assignment-${assignment.id}`,
        title: `מטלה ב${assignment.course} להגשה ${days === 0 ? "היום" : days === 1 ? "מחר" : `בעוד ${days} ימים`}`,
        description: assignment.title,
        icon: "FileText",
        severity: days <= 1 ? "urgent" : "warning",
      });
    }
  }

  const tuitionSummary = summarizeTuition(getTuitionTransactions(transactions));
  if (tuitionSummary.nextInstallment) {
    const dueDate = tuitionSummary.nextInstallment.due_date;
    if (dueDate) {
      const days = daysUntil(dueDate, now);
      if (days >= 0 && days <= 7) {
        reminders.push({
          id: "tuition-next",
          title: `נשאר תשלום שכר לימוד בעוד ${days === 0 ? "היום" : days === 1 ? "יום" : `${days} ימים`}`,
          description: tuitionSummary.nextInstallment.title,
          icon: "Wallet",
          severity: days <= 2 ? "urgent" : "warning",
          href: "/finance",
        });
      }
    }
  }

  for (const doc of documents) {
    if (doc.status === "needs_correction") {
      reminders.push({
        id: `document-${doc.id}`,
        title: `מסמך "${doc.name}" נדחה ודורש תיקון`,
        description: "יש לתקן ולהעלות מחדש את המסמך",
        icon: "AlertTriangle",
        severity: "urgent",
        href: "/documents",
      });
    }
  }

  const hasScholarshipForm = documents.some((doc) => doc.category === "טופס מלגה");
  if (!hasScholarshipForm) {
    reminders.push({
      id: "scholarship-form-missing",
      title: "טופס מלגה חסר - יש להגיש בהקדם",
      description: "העלו את טופס המלגה במרכז המסמכים",
      icon: "Award",
      severity: "info",
      href: "/documents",
    });
  }

  const registrationDays = daysUntil(REGISTRATION_DEADLINE, now);
  if (registrationDays >= 0 && registrationDays <= 14) {
    reminders.push({
      id: "registration-deadline",
      title: `הרישום לקורסים לסמסטר הבא נסגר בעוד ${registrationDays === 0 ? "היום" : registrationDays === 1 ? "יום" : `${registrationDays} ימים`}`,
      description: "ודאו שנרשמתם לכל הקורסים הנדרשים",
      icon: "CalendarClock",
      severity: registrationDays <= 3 ? "warning" : "info",
    });
  }

  const SEVERITY_ORDER: Record<SmartReminder["severity"], number> = {
    urgent: 0,
    warning: 1,
    info: 2,
  };

  return reminders.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}
