import Link from "next/link";
import { CalendarDays, ChevronLeft, GraduationCap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEMO_EXAMS } from "@/lib/constants";

const HORIZON_DAYS = 14;

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function daysLabel(days: number): string {
  if (days === 0) return "היום";
  if (days === 1) return "מחר";
  return `בעוד ${days} ימים`;
}

export function UpcomingExamsCard() {
  const exams = DEMO_EXAMS.filter((exam) => {
    const days = daysUntil(exam.date);
    return days >= 0 && days <= HORIZON_DAYS;
  }).map((exam) => ({
    ...exam,
    days: daysUntil(exam.date),
  }));

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-[14px]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "#FEF2F2" }}>
            <GraduationCap className="h-4 w-4" style={{ color: "#EF4444" }} />
          </div>
          מבחנים קרובים
        </CardTitle>
        <Link
          href="/exams"
          className="flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
        >
          הכל
          <ChevronLeft className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-1 p-4 pt-0">
        {exams.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-[12px] text-muted-foreground">אין מבחנים בטווח הקרוב</p>
          </div>
        ) : (
          exams.map((exam) => (
            <div key={exam.id} className="flex items-center justify-between gap-3 rounded-xl px-1 py-2">
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold text-foreground">{exam.course}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {exam.time} · {exam.room}
                </p>
              </div>
              <Badge variant={exam.days <= 3 ? "destructive" : "warning"} className="shrink-0 text-[10px]">
                {daysLabel(exam.days)}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
