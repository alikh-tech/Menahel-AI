"use client";

import { useState } from "react";
import { CalendarDays, Clock, GraduationCap, IdCard, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AcademicDocumentDialog } from "@/components/documents/academic-document-dialog";
import { ACADEMIC_DOCUMENT_TYPES, DEMO_EXAMS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { AcademicDocumentType, Profile } from "@/types";

const EXAM_CARD_DOCUMENT = ACADEMIC_DOCUMENT_TYPES.find((doc) => doc.id === "exam-card") ?? null;

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

export function ExamsClient({ profile }: { profile: Profile }) {
  const [activeDoc, setActiveDoc] = useState<AcademicDocumentType | null>(null);

  const exams = [...DEMO_EXAMS]
    .map((exam) => ({ ...exam, days: daysUntil(exam.date) }))
    .filter((exam) => exam.days >= 0)
    .sort((a, b) => a.days - b.days);

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">מבחנים קרובים</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            כל מועדי הבחינות הקרובים שלך, עם גישה ישירה לכרטיס הנבחן
          </p>
        </div>
        {EXAM_CARD_DOCUMENT && (
          <Button variant="outline" size="sm" onClick={() => setActiveDoc(EXAM_CARD_DOCUMENT)}>
            <IdCard className="h-3.5 w-3.5" />
            כרטיס נבחן
          </Button>
        )}
      </div>

      {exams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <CalendarDays className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-[13px] text-muted-foreground">אין מבחנים קרובים</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam, i) => (
            <Card key={exam.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#FEF2F2" }}>
                      <GraduationCap className="h-[18px] w-[18px]" style={{ color: "#EF4444" }} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">{exam.course}</p>
                      <p className="text-[11px] text-muted-foreground">{formatDate(exam.date)}</p>
                    </div>
                  </div>
                  <Badge variant={exam.days <= 3 ? "destructive" : "warning"} className="shrink-0 text-[10px]">
                    {daysLabel(exam.days)}
                  </Badge>
                </div>

                <div className="space-y-1.5 border-t border-border pt-3 text-[12px] text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    שעה {exam.time}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {exam.room}
                  </p>
                </div>

                {EXAM_CARD_DOCUMENT && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setActiveDoc(EXAM_CARD_DOCUMENT)}
                  >
                    <IdCard className="h-3.5 w-3.5" />
                    פתיחת כרטיס נבחן
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AcademicDocumentDialog docType={activeDoc} profile={profile} onClose={() => setActiveDoc(null)} />
    </div>
  );
}
