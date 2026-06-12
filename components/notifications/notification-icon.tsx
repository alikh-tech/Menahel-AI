import {
  Bell,
  GraduationCap,
  ClipboardList,
  Wallet,
  FileWarning,
  FileCheck2,
  CalendarClock,
  Inbox,
  CheckCircle2,
  XCircle,
  type LucideProps,
} from "lucide-react";

const ICONS = {
  Bell,
  GraduationCap,
  ClipboardList,
  Wallet,
  FileWarning,
  FileCheck2,
  CalendarClock,
  Inbox,
  CheckCircle2,
  XCircle,
} as const;

export type NotificationIconName = keyof typeof ICONS;

export function NotificationIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICONS[name as NotificationIconName] ?? Bell;
  return <Icon {...props} />;
}
