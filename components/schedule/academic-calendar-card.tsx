import { CalendarClock, FileSignature, GraduationCap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ACADEMIC_CALENDAR_EVENTS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

const TYPE_ICON = {
  exam: GraduationCap,
  deadline: CalendarClock,
  semester: FileSignature,
} as const;

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function AcademicCalendarCard() {
  const events = [...ACADEMIC_CALENDAR_EVENTS]
    .filter((event) => daysUntil(event.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Card className="animate-fade-in">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-[14px]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "#F5F3FF" }}>
            <CalendarClock className="h-4 w-4" style={{ color: "#7C3AED" }} />
          </div>
          לוח שנה אקדמי
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5 p-4 pt-0">
        {events.length === 0 ? (
          <p className="py-4 text-center text-[12px] text-muted-foreground">אין אירועים קרובים</p>
        ) : (
          events.map((event) => {
            const Icon = TYPE_ICON[event.type];
            const days = daysUntil(event.date);
            return (
              <div key={event.id} className="flex items-center justify-between gap-3 rounded-xl px-1 py-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-semibold text-foreground">{event.title}</p>
                    <p className="text-[11px] text-muted-foreground">{formatDate(event.date)}</p>
                  </div>
                </div>
                <Badge variant={days <= 3 ? "destructive" : "secondary"} className="shrink-0 text-[10px]">
                  {days === 0 ? "היום" : days === 1 ? "מחר" : `בעוד ${days} ימים`}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
