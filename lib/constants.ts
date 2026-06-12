import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSearch,
  Inbox,
  Loader2,
  FileWarning,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import type {
  NavItem,
  CourseGrade,
  ScheduleSlot,
  ExamItem,
  AssignmentItem,
  AcademicDocumentType,
  AcademicCalendarEvent,
  DocumentStatus,
  RequestType,
  RequestStatus,
} from "@/types";

export const NAV_ITEMS: NavItem[] = [
  { title: "לוח בקרה", href: "/dashboard", icon: "LayoutDashboard" },
  { title: "מערכת שעות", href: "/schedule", icon: "CalendarDays" },
  { title: "מבחנים", href: "/exams", icon: "ClipboardCheck" },
  { title: "ציונים", href: "/grades", icon: "BarChart3" },
  { title: "בקשות", href: "/requests", icon: "FileSignature" },
  { title: "עוזר AI", href: "/ai-assistant", icon: "Bot" },
  { title: "מרכז מסמכים", href: "/documents", icon: "FolderOpen" },
  { title: "מרכז כספים", href: "/finance", icon: "Wallet" },
  { title: "תזכורות", href: "/reminders", icon: "Clock" },
  { title: "התראות", href: "/notifications", icon: "Bell" },
  { title: "פרופיל", href: "/profile", icon: "User" },
];

// Main screens shown in the topbar quick-switch (everything except profile)
export const SCREENS: NavItem[] = NAV_ITEMS.filter((item) => item.href !== "/profile");

export const PAGE_SUBTITLES: Record<string, string> = {
  "/dashboard": "לוח בקרה",
  "/schedule": "מערכת שעות",
  "/exams": "מבחנים קרובים",
  "/grades": "ציונים והתקדמות אקדמית",
  "/requests": "בקשות מנהלתיות",
  "/ai-assistant": "עוזר AI",
  "/documents": "מרכז מסמכים",
  "/finance": "מרכז פיננסי",
  "/reminders": "תזכורות חכמות",
  "/notifications": "התראות",
  "/profile": "פרופיל אישי",
};

export const DOCUMENT_CATEGORIES = [
  "תעודת זהות",
  "צילום תעודת זהות",
  "אישור לימודים",
  "גיליון ציונים",
  "טופס מלגה",
  "אישור העסקת הורה",
  "אישור שירות צבאי",
  "טופס פטור",
  "חוזה שכר דירה",
  "אישור הכנסה",
  "אחר",
] as const;

export const TRANSACTION_CATEGORIES = [
  "שכר לימוד",
  "מלגה",
  "הלוואת סטודנט",
  "שכירות",
  "תחבורה",
  "ספרים וציוד",
  "אוכל",
  "בריאות",
  "חידוש כרטיס סטודנט",
  "דמי טיפול",
  "קנסות",
  "אחר",
] as const;

export const REMINDER_CATEGORIES = [
  "הרשמה לקורסים",
  "תשלום שכר לימוד",
  "מבחן",
  "הגשת עבודה",
  "מלגה",
  "פגישה",
  "אחר",
] as const;

function addDays(days: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

// Demo course list backing the "גיליון ציונים" document. Academic summary
// stats (average, credits earned, active courses) shown across the app are
// derived from this list via lib/academics.ts#computeAcademicStats so they
// never disagree.
export const DEMO_COURSES: CourseGrade[] = [
  { code: "ECO101", name: "מבוא לכלכלה", semester: "סמסטר א' תשפ\"ד", credits: 3, grade: 88 },
  { code: "CS102", name: "תכנות מונחה עצמים", semester: "סמסטר א' תשפ\"ד", credits: 4, grade: 92 },
  { code: "STAT110", name: "סטטיסטיקה למדעי החברה", semester: "סמסטר א' תשפ\"ד", credits: 3, grade: 85 },
  { code: "ENG201", name: "אנגלית מתקדמים", semester: "סמסטר א' תשפ\"ד", credits: 2, grade: 90 },
  { code: "CS210", name: "מבני נתונים", semester: "סמסטר ב' תשפ\"ד", credits: 4, grade: 86 },
  { code: "MATH120", name: "חשבון דיפרנציאלי ואינטגרלי", semester: "סמסטר ב' תשפ\"ד", credits: 3, grade: 81 },
  { code: "MIS220", name: "מערכות מידע ניהוליות", semester: "סמסטר ב' תשפ\"ד", credits: 3, grade: 89 },
  { code: "ECO205", name: "כלכלה ניהולית", semester: "סמסטר ב' תשפ\"ד", credits: 3, grade: 90 },
];

// Weekly schedule for "מערכת שעות" (Sunday-Thursday academic week).
export const DEMO_SCHEDULE: ScheduleSlot[] = [
  { day: "ראשון", time: "09:00 - 11:00", course: "מבוא לכלכלה", lecturer: "ד\"ר רונית כהן", room: "אולם 101", type: "הרצאה" },
  { day: "ראשון", time: "12:00 - 14:00", course: "תכנות מונחה עצמים", lecturer: "מר אבי לוי", room: "מעבדה 3", type: "תרגול" },
  { day: "שני", time: "10:00 - 12:00", course: "סטטיסטיקה למדעי החברה", lecturer: "ד\"ר מיכל ברק", room: "כיתה 204", type: "הרצאה" },
  { day: "שלישי", time: "09:00 - 11:00", course: "מבני נתונים", lecturer: "פרופ' יוסי שרון", room: "מעבדה 1", type: "הרצאה" },
  { day: "שלישי", time: "13:00 - 15:00", course: "אנגלית מתקדמים", lecturer: "גב' דנה אלון", room: "כיתה 305", type: "שיעור" },
  { day: "רביעי", time: "11:00 - 13:00", course: "חשבון דיפרנציאלי ואינטגרלי", lecturer: "ד\"ר עומר פרידמן", room: "כיתה 102", type: "תרגול" },
  { day: "חמישי", time: "09:00 - 11:00", course: "מערכות מידע ניהוליות", lecturer: "ד\"ר נועה גולן", room: "כיתה 201", type: "הרצאה" },
  { day: "חמישי", time: "12:00 - 14:00", course: "כלכלה ניהולית", lecturer: "פרופ' אילן שגיא", room: "כיתה 203", type: "הרצאה" },
];

// Upcoming exams, dated relative to today for realistic smart reminders.
export const DEMO_EXAMS: ExamItem[] = [
  { id: "exam-1", course: "סטטיסטיקה למדעי החברה", date: addDays(3), time: "09:00", room: "כיתה 204" },
  { id: "exam-2", course: "מבני נתונים", date: addDays(8), time: "13:00", room: "מעבדה 1" },
  { id: "exam-3", course: "מבוא לבינה מלאכותית", date: addDays(14), time: "10:00", room: "כיתה 203" },
  { id: "exam-4", course: "כלכלה ניהולית", date: addDays(21), time: "11:00", room: "כיתה 203" },
];

// Upcoming assignments, dated relative to today.
export const DEMO_ASSIGNMENTS: AssignmentItem[] = [
  { id: "assignment-1", course: "Java", title: "הגשת תרגיל בית 4", dueDate: addDays(1) },
  { id: "assignment-2", course: "UI/UX", title: "הגשת פרויקט עיצוב", dueDate: addDays(2) },
  { id: "assignment-3", course: "מערכות מידע ניהוליות", title: "עבודה סמינריונית - שלב א'", dueDate: addDays(5) },
];

// Course-registration deadline for the next semester (relative to today).
export const REGISTRATION_DEADLINE = addDays(12);

// Academic calendar events surfaced on the schedule page - combines exam
// dates with the registration deadline and semester boundaries.
export const ACADEMIC_CALENDAR_EVENTS: AcademicCalendarEvent[] = [
  ...DEMO_EXAMS.map((exam) => ({
    id: `calendar-${exam.id}`,
    title: `מבחן: ${exam.course}`,
    date: exam.date,
    type: "exam" as const,
  })),
  { id: "calendar-registration", title: "סגירת רישום לקורסים - סמסטר הבא", date: REGISTRATION_DEADLINE, type: "deadline" as const },
  { id: "calendar-semester-end", title: "סיום סמסטר ב' תשפ\"ד", date: addDays(45), type: "semester" as const },
];

// Self-service academic documents - served from existing files in the
// "students-documents" storage bucket via signed URLs (no demo generation).
export const ACADEMIC_DOCUMENT_TYPES: AcademicDocumentType[] = [
  {
    id: "study-confirmation",
    title: "אישור לימודים",
    description: "אישור רשמי המעיד על מעמד הסטודנט לסמסטר הנוכחי",
    icon: "FileCheck2",
    available: true,
    storagePath: "students-documents/Ishor-lemodem.pdf",
  },
  {
    id: "exam-card",
    title: "כרטיס נבחן",
    description: "כרטיס הכולל את פרטי הסטודנט ומועדי הבחינות הקרובות",
    icon: "IdCard",
    available: true,
    storagePath: "students-documents/EXAMS.pdf",
  },
  {
    id: "grades-sheet",
    title: "גיליון ציונים",
    description: "גיליון ציונים מלא הכולל ממוצע, נקודות זכות וקורסים",
    icon: "FileBarChart",
    available: true,
    storagePath: "students-documents/Grades.pdf",
  },
  {
    id: "schedule",
    title: "מערכת שעות",
    description: "מערכת השעות השבועית לסמסטר הנוכחי",
    icon: "CalendarDays",
    available: true,
    storagePath: "students-documents/HOUR.pdf",
  },
  {
    id: "degree-eligibility",
    title: "אישור זכאות לתואר",
    description: "אישור על עמידה בדרישות לתואר - יופעל בקרוב",
    icon: "GraduationCap",
    available: false,
  },
  {
    id: "special-exam-request",
    title: "בקשה למועד מיוחד",
    description: "טופס בקשה למועד בחינה מיוחד עבור קורס",
    icon: "FileSignature",
    available: true,
    storagePath: "students-documents/Specail.pdf",
  },
];

// Tuition payment plan model - represented as "שכר לימוד" transactions, no schema change needed.
export const TUITION_CONFIG = {
  category: "שכר לימוד",
  total: 15000,
  installments: 10,
  perInstallment: 1500,
  paidByDefault: 5,
} as const;

// Additional one-off charges payable from the Finance Center.
export const ADDITIONAL_CHARGES = [
  { label: "חידוש כרטיס סטודנט", amount: 30, category: "חידוש כרטיס סטודנט" },
  { label: "דמי טיפול", amount: 50, category: "דמי טיפול" },
  { label: "קנס איחור", amount: 75, category: "קנסות" },
] as const;

// Display metadata for the 4-state uploaded-document review workflow.
export const DOCUMENT_STATUS_META: Record<
  DocumentStatus,
  { label: string; variant: "secondary" | "warning" | "destructive" | "success"; icon: LucideIcon }
> = {
  received: { label: "התקבל", variant: "secondary", icon: Clock },
  in_review: { label: "בבדיקה", variant: "warning", icon: FileSearch },
  needs_correction: { label: "נדרש תיקון", variant: "destructive", icon: AlertTriangle },
  approved: { label: "אושר", variant: "success", icon: CheckCircle2 },
};

// Administrative request types supported by the Requests module.
export const REQUEST_TYPE_META: Record<RequestType, { label: string; description: string }> = {
  special_exam: { label: "בקשה למועד מיוחד", description: "בקשה למועד בחינה מיוחד עבור קורס" },
  grade_appeal: { label: "השגה על ציון", description: "בקשה לבדיקה חוזרת של ציון בקורס" },
  scholarship: { label: "בקשת מלגה", description: "הגשת בקשה למלגה או סיוע כלכלי" },
  inquiry: { label: "פנייה מנהלתית", description: "פנייה כללית למשרדי הסטודנטים" },
};

// Display metadata for the 5-state administrative request workflow.
export const REQUEST_STATUS_META: Record<
  RequestStatus,
  { label: string; variant: "secondary" | "warning" | "destructive" | "success"; icon: LucideIcon }
> = {
  received: { label: "התקבל", variant: "secondary", icon: Inbox },
  in_progress: { label: "בטיפול", variant: "warning", icon: Loader2 },
  document_required: { label: "נדרש מסמך", variant: "warning", icon: FileWarning },
  approved: { label: "אושר", variant: "success", icon: CheckCircle2 },
  rejected: { label: "נדחה", variant: "destructive", icon: XCircle },
};
