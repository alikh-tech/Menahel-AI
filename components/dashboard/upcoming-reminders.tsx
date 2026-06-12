import Link from "next/link";
import { Bell, ChevronLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Reminder } from "@/types";
import { cn, formatDate } from "@/lib/utils";

const PRIORITY_LABEL: Record<Reminder["priority"], string> = {
  high: "דחוף",
  medium: "בינוני",
  low: "נמוך",
};

const PRIORITY_VARIANT: Record<Reminder["priority"], "destructive" | "warning" | "secondary"> = {
  high: "destructive",
  medium: "warning",
  low: "secondary",
};

export function UpcomingReminders({ reminders }: { reminders: Reminder[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <CardTitle className="text-[14px]">תזכורות קרובות</CardTitle>
        <Link
          href="/reminders"
          className="flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
        >
          הכל
          <ChevronLeft className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-1 p-4 pt-0">
        {reminders.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-[12px] text-muted-foreground">
              אין תזכורות קרובות. כל הכבוד!
            </p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-accent"
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold text-foreground">
                  {reminder.title}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {reminder.category} · {formatDate(reminder.due_date)}
                </p>
              </div>
              <Badge variant={PRIORITY_VARIANT[reminder.priority]} className="shrink-0 text-[10px]">
                {PRIORITY_LABEL[reminder.priority]}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
