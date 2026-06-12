import type { Database } from "./database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type Reminder = Database["public"]["Tables"]["reminders"]["Row"];
export type AiMessage = Database["public"]["Tables"]["ai_messages"]["Row"];
export type AppNotification = Database["public"]["Tables"]["notifications"]["Row"];
export type AdminRequest = Database["public"]["Tables"]["requests"]["Row"];

export type DocumentStatus = DocumentRow["status"];
export type TransactionType = Transaction["type"];
export type TransactionStatus = Transaction["status"];
export type ReminderPriority = Reminder["priority"];
export type NotificationSeverity = AppNotification["severity"];
export type NotificationChannel = AppNotification["channel"];
export type RequestType = AdminRequest["type"];
export type RequestStatus = AdminRequest["status"];

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface DemoAction {
  label: string;
  type: "view" | "download" | "email";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  actions?: DemoAction[];
}

export interface StatCardData {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: string;
}

export interface CourseGrade {
  code: string;
  name: string;
  semester: string;
  credits: number;
  grade: number;
}

export interface ScheduleSlot {
  day: string;
  time: string;
  course: string;
  lecturer: string;
  room: string;
  type: string;
}

export interface AcademicCalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "exam" | "deadline" | "semester";
}

export interface ExamItem {
  id: string;
  course: string;
  date: string;
  time: string;
  room: string;
}

export interface AssignmentItem {
  id: string;
  course: string;
  title: string;
  dueDate: string;
}

export interface AcademicDocumentType {
  id: string;
  title: string;
  description: string;
  icon: string;
  available: boolean;
  storagePath?: string;
}

export interface SmartReminder {
  id: string;
  title: string;
  description: string;
  icon: string;
  severity: "urgent" | "warning" | "info";
  href?: string;
}
