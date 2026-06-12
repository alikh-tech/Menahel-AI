"use client";

import { useState } from "react";
import {
  CalendarDays,
  Download,
  Eye,
  FileBarChart,
  FileCheck2,
  FileSignature,
  GraduationCap,
  IdCard,
  Mail,
  type LucideIcon,
} from "lucide-react";

import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ACADEMIC_DOCUMENT_TYPES } from "@/lib/constants";
import { getAcademicDocumentDownloadUrl } from "@/lib/academic-documents";
import { AcademicDocumentDialog } from "@/components/documents/academic-document-dialog";
import type { AcademicDocumentType, Profile } from "@/types";

const ICON_MAP: Record<string, LucideIcon> = {
  FileCheck2,
  IdCard,
  FileBarChart,
  CalendarDays,
  GraduationCap,
  FileSignature,
};

export function AcademicDocumentsSection({ profile }: { profile: Profile }) {
  const [activeDoc, setActiveDoc] = useState<AcademicDocumentType | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function handleDownload(docType: AcademicDocumentType) {
    if (!docType.storagePath) return;

    setDownloadingId(docType.id);
    const url = await getAcademicDocumentDownloadUrl(docType.storagePath);
    setDownloadingId(null);

    if (!url) {
      toast.error("שגיאה בהורדת המסמך");
      return;
    }

    window.open(url, "_blank");
  }

  return (
    <div>
      <h2 className="text-base font-bold tracking-tight text-foreground">מסמכים אקדמיים</h2>
      <p className="mt-1 text-[13px] text-muted-foreground">
        הפיקו מסמכים רשמיים בהתבסס על הפרופיל האקדמי שלכם
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACADEMIC_DOCUMENT_TYPES.map((docType, i) => {
          const Icon = ICON_MAP[docType.icon] ?? FileCheck2;
          return (
            <Card
              key={docType.id}
              className="animate-fade-in transition-shadow hover:shadow-soft"
              style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
            >
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: "#EEF2FF" }}
                    >
                      <Icon className="h-[18px] w-[18px]" style={{ color: "#4F46E5" }} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-foreground">{docType.title}</p>
                      <p className="text-[11px] text-muted-foreground">{docType.description}</p>
                    </div>
                  </div>
                  {!docType.available && (
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      בקרוב
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1.5 border-t border-border pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 flex-1 rounded-lg text-[11px]"
                    disabled={!docType.available}
                    onClick={() => setActiveDoc(docType)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    הצג
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-lg"
                    disabled={!docType.available || downloadingId === docType.id}
                    title="הורד"
                    onClick={() => handleDownload(docType)}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-lg"
                    disabled={!docType.available}
                    title="שלח למייל"
                    onClick={() => setActiveDoc(docType)}
                  >
                    <Mail className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AcademicDocumentDialog docType={activeDoc} profile={profile} onClose={() => setActiveDoc(null)} />
    </div>
  );
}
