import { Clock, MapPin, User } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEMO_SCHEDULE } from "@/lib/constants";

const DAYS_ORDER = ["ראשון", "שני", "שלישי", "רביעי", "חמישי"];

const TYPE_VARIANT: Record<string, "secondary" | "outline" | "warning"> = {
  הרצאה: "secondary",
  תרגול: "outline",
  שיעור: "warning",
};

export function WeeklySchedule() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      {DAYS_ORDER.map((day, i) => {
        const slots = DEMO_SCHEDULE.filter((slot) => slot.day === day);
        return (
          <Card key={day} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-[14px]">יום {day}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4 pt-0">
              {slots.length === 0 ? (
                <p className="py-4 text-center text-[12px] text-muted-foreground">אין שיעורים</p>
              ) : (
                slots.map((slot, idx) => (
                  <div key={idx} className="rounded-xl border border-border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[12px] font-semibold text-foreground">{slot.course}</p>
                      <Badge variant={TYPE_VARIANT[slot.type] ?? "secondary"} className="shrink-0 text-[10px]">
                        {slot.type}
                      </Badge>
                    </div>
                    <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                      <p className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {slot.time}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <User className="h-3 w-3" />
                        {slot.lecturer}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        {slot.room}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
