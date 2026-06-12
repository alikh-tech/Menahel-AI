"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getAcademicDocumentDownloadUrl,
  getAcademicDocumentViewUrl,
} from "@/lib/academic-documents";
import type { AcademicDocumentType, Profile } from "@/types";

interface AcademicDocumentDialogProps {
  docType: AcademicDocumentType | null;
  profile: Profile;
  onClose: () => void;
}

export function AcademicDocumentDialog({ docType, onClose }: AcademicDocumentDialogProps) {
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!docType?.storagePath) {
      setViewUrl(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setViewUrl(null);

    getAcademicDocumentViewUrl(docType.storagePath).then((url) => {
      if (cancelled) return;
      setLoading(false);
      if (!url) {
        toast.error("שגיאה בטעינת המסמך");
        return;
      }
      setViewUrl(url);
    });

    return () => {
      cancelled = true;
    };
  }, [docType]);

  async function handleDownload() {
    if (!docType?.storagePath) return;

    const url = await getAcademicDocumentDownloadUrl(docType.storagePath);
    if (!url) {
      toast.error("שגיאה בהורדת המסמך");
      return;
    }

    window.open(url, "_blank");
  }

  function handleEmail() {
    toast.info("שליחה במייל אינה זמינה כרגע - ניתן להוריד את המסמך ולשלוח אותו באופן עצמאי");
  }

  return (
    <Dialog open={!!docType} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        {docType && (
          <>
            <DialogHeader>
              <DialogTitle>{docType.title}</DialogTitle>
            </DialogHeader>

            <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
              {loading || !viewUrl ? (
                <div className="flex h-[60vh] items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <iframe src={viewUrl} title={docType.title} className="h-[60vh] w-full" />
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleEmail}>
                <Mail className="h-4 w-4" />
                שלח למייל
              </Button>
              <Button className="flex-1" onClick={handleDownload}>
                <Download className="h-4 w-4" />
                הורד PDF
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
