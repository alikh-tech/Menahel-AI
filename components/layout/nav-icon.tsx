import {
  LayoutDashboard,
  Sparkles,
  FileText,
  FolderOpen,
  Wallet,
  Bell,
  Clock,
  User,
  Bot,
  CalendarDays,
  ClipboardCheck,
  BarChart3,
  FileSignature,
  type LucideProps,
} from "lucide-react";

const ICONS = {
  LayoutDashboard,
  Sparkles,
  FileText,
  FolderOpen,
  Wallet,
  Bell,
  Clock,
  User,
  Bot,
  CalendarDays,
  ClipboardCheck,
  BarChart3,
  FileSignature,
} as const;

export type IconName = keyof typeof ICONS;

export function NavIcon({
  name,
  ...props
}: { name: string } & LucideProps) {
  const Icon = ICONS[name as IconName] ?? LayoutDashboard;
  return <Icon {...props} />;
}
