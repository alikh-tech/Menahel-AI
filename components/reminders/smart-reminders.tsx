import Link from "next/link";
import {
  AlertTriangle,
  Award,
  Bell,
  CalendarClock,
  FileText,
  GraduationCap,
  Sparkles,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SmartReminder } from "@/types";

const ICON_MAP: Record<string, LucideIcon> = {
  GraduationCap,
  FileText,
  Wallet,
  AlertTriangle,
  Award,
  CalendarClock,
};

const SEVERITY_STYLE: Record<SmartReminder["severity"], { border: string; bg: string; color: string }> = {
  urgent: { border: "#EF4444", bg: "#FEF2F2", color: "#EF4444" },
  warning: { border: "#D97706", bg: "#FFFBEB", color: "#D97706" },
  info: { border: "#4F46E5", bg: "#EEF2FF", color: "#4F46E5" },
};

export function SmartReminders({ items }: { items: SmartReminder[] }) {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-[14px]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "#F5F3FF" }}>
            <Sparkles className="h-4 w-4" style={{ color: "#7C3AED" }} />
          </div>
          תזכורות חכמות
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-[12px] text-muted-foreground">אין תזכורות חכמות כרגע</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, i) => {
              const Icon = ICON_MAP[item.icon] ?? Bell;
              const style = SEVERITY_STYLE[item.severity];
              const content = (
                <div
                  className="flex animate-fade-in items-start gap-3 rounded-xl border-r-2 px-3 py-2.5 transition-colors hover:bg-accent"
                  style={{ borderColor: style.border, animationDelay: `${i * 30}ms` }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: style.bg }}
                  >
                    <Icon className="h-4 w-4" style={{ color: style.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-foreground">{item.title}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              );

              return item.href ? (
                <Link key={item.id} href={item.href} className={cn("block")}>
                  {content}
                </Link>
              ) : (
                <div key={item.id}>{content}</div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
