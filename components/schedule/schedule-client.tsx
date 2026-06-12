"use client";

import { useState } from "react";
import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WeeklySchedule } from "@/components/schedule/weekly-schedule";
import { AcademicCalendarCard } from "@/components/schedule/academic-calendar-card";
import { AcademicDocumentDialog } from "@/components/documents/academic-document-dialog";
import { ACADEMIC_DOCUMENT_TYPES } from "@/lib/constants";
import type { AcademicDocumentType, Profile } from "@/types";

const SCHEDULE_DOCUMENT = ACADEMIC_DOCUMENT_TYPES.find((doc) => doc.id === "schedule") ?? null;

export function ScheduleClient({ profile }: { profile: Profile }) {
  const [activeDoc, setActiveDoc] = useState<AcademicDocumentType | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">מערכת שעות</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            מערכת השעות השבועית והאירועים בלוח השנה האקדמי
          </p>
        </div>
        {SCHEDULE_DOCUMENT && (
          <Button variant="outline" size="sm" onClick={() => setActiveDoc(SCHEDULE_DOCUMENT)}>
            <FileText className="h-3.5 w-3.5" />
            פתח מערכת שעות (PDF)
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <WeeklySchedule />
        <AcademicCalendarCard />
      </div>

      <AcademicDocumentDialog docType={activeDoc} profile={profile} onClose={() => setActiveDoc(null)} />
    </div>
  );
}
