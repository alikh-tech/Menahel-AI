"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Eye, FileText, Loader2, Search, Trash2, FolderOpen, CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadDialog } from "@/components/documents/upload-dialog";
import { AcademicDocumentsSection } from "@/components/documents/academic-documents-section";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatFileSize } from "@/lib/utils";
import { DOCUMENT_CATEGORIES, DOCUMENT_STATUS_META } from "@/lib/constants";
import { getDocumentMeta } from "@/lib/document-meta";
import type { DocumentRow, Profile } from "@/types";

export function DocumentsClient({
  initialDocuments,
  profile,
}: {
  initialDocuments: DocumentRow[];
  profile: Profile;
}) {
  const [documents, setDocuments] = useState<DocumentRow[]>(initialDocuments);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [previewDoc, setPreviewDoc] = useState<DocumentRow | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DocumentRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || doc.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [documents, search, category]);

  const summary = useMemo(
    () => ({
      total: documents.length,
      approved: documents.filter((d) => d.status === "approved").length,
      pendingReview: documents.filter((d) => d.status === "received" || d.status === "in_review").length,
      needsCorrection: documents.filter((d) => d.status === "needs_correction").length,
    }),
    [documents]
  );

  useEffect(() => {
    if (!previewDoc) {
      setPreviewUrl(null);
      return;
    }

    const isPreviewable =
      previewDoc.mime_type === "application/pdf" || previewDoc.mime_type.startsWith("image/");

    if (!isPreviewable) {
      setPreviewUrl(null);
      return;
    }

    let cancelled = false;
    setPreviewLoading(true);
    setPreviewUrl(null);

    const supabase = createClient();
    supabase.storage
      .from("documents")
      .createSignedUrl(previewDoc.file_path, 300)
      .then(({ data, error }) => {
        if (cancelled) return;
        setPreviewLoading(false);
        if (error || !data) return;
        setPreviewUrl(data.signedUrl);
      });

    return () => {
      cancelled = true;
    };
  }, [previewDoc]);

  async function handleDownload(doc: DocumentRow) {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.file_path, 60);

    if (error || !data) {
      toast.error("שגיאה ביצירת קישור הורדה");
      return;
    }

    window.open(data.signedUrl, "_blank");
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const doc = deleteTarget;

    setDeleting(true);
    const supabase = createClient();

    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([doc.file_path]);

    if (storageError) {
      toast.error("שגיאה במחיקת הקובץ");
      setDeleting(false);
      return;
    }

    const { error } = await supabase.from("documents").delete().eq("id", doc.id);

    setDeleting(false);

    if (error) {
      toast.error("שגיאה במחיקת המסמך");
      return;
    }

    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    setDeleteTarget(null);
    toast.success("המסמך נמחק");
  }

  return (
    <div className="space-y-6">
      <AcademicDocumentsSection profile={profile} />

      <div>
        <h2 className="text-base font-bold tracking-tight text-foreground">מסמכים שהעליתי</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          מסמכים שהועלו על ידכם לבקשת המנהל - כגון טפסים, אישורים ותעודות
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="animate-fade-in">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "#EEF2FF" }}>
              <FolderOpen className="h-4 w-4" style={{ color: "#4F46E5" }} />
            </div>
            <div>
              <p className="text-lg font-bold leading-none text-foreground">{summary.total}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">סה&quot;כ מסמכים</p>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in [animation-delay:50ms]">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "#ECFDF5" }}>
              <CheckCircle2 className="h-4 w-4" style={{ color: "#10B981" }} />
            </div>
            <div>
              <p className="text-lg font-bold leading-none text-foreground">{summary.approved}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">אושרו</p>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in [animation-delay:100ms]">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "#FFFBEB" }}>
              <Clock className="h-4 w-4" style={{ color: "#D97706" }} />
            </div>
            <div>
              <p className="text-lg font-bold leading-none text-foreground">{summary.pendingReview}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">ממתינים לבדיקה</p>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in [animation-delay:150ms]">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "#FEF2F2" }}>
              <XCircle className="h-4 w-4" style={{ color: "#EF4444" }} />
            </div>
            <div>
              <p className="text-lg font-bold leading-none text-foreground">{summary.needsCorrection}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">דורשים תיקון</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="חיפוש מסמכים..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>

        <div className="flex gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="כל הקטגוריות" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הקטגוריות</SelectItem>
              {DOCUMENT_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <UploadDialog onUploaded={(doc) => setDocuments((prev) => [doc, ...prev])} />
        </div>
      </div>

      {/* Documents grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/40" />
            <div>
              <p className="text-[13px] font-semibold text-foreground">אין מסמכים להצגה</p>
              <p className="text-[12px] text-muted-foreground">
                העלו את המסמך הראשון שלכם כדי להתחיל
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc, i) => {
            const meta = getDocumentMeta(doc.category);
            const Icon = meta.icon;
            return (
              <Card
                key={doc.id}
                className="animate-fade-in transition-shadow hover:shadow-soft"
                style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
              >
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: meta.iconBg }}
                      >
                        <Icon className="h-[18px] w-[18px]" style={{ color: meta.iconColor }} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-foreground">{doc.name}</p>
                        <p className="text-[11px] text-muted-foreground">{doc.category}</p>
                      </div>
                    </div>
                    <Badge variant={DOCUMENT_STATUS_META[doc.status].variant} className="shrink-0 text-[10px]">
                      {DOCUMENT_STATUS_META[doc.status].label}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{formatFileSize(doc.file_size)}</span>
                    <span>{formatDate(doc.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 border-t border-border pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 flex-1 rounded-lg text-[11px]"
                      onClick={() => setPreviewDoc(doc)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      הצג
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 flex-1 rounded-lg text-[11px]"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="h-3.5 w-3.5" />
                      הורדה
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0 rounded-lg text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(doc)}
                      title="מחיקה"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Preview modal */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className={previewDoc?.mime_type === "application/pdf" || previewDoc?.mime_type.startsWith("image/") ? "sm:max-w-2xl" : undefined}>
          {previewDoc && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {(() => {
                    const meta = getDocumentMeta(previewDoc.category);
                    const Icon = meta.icon;
                    return (
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: meta.iconBg }}
                      >
                        <Icon className="h-[18px] w-[18px]" style={{ color: meta.iconColor }} />
                      </div>
                    );
                  })()}
                  <span className="text-right">{previewDoc.name}</span>
                </DialogTitle>
              </DialogHeader>

              {previewDoc.mime_type === "application/pdf" && (
                <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
                  {previewLoading || !previewUrl ? (
                    <div className="flex h-80 items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <iframe src={previewUrl} title={previewDoc.name} className="h-80 w-full" />
                  )}
                </div>
              )}

              {previewDoc.mime_type.startsWith("image/") && (
                <div className="flex items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/30">
                  {previewLoading || !previewUrl ? (
                    <div className="flex h-80 w-full items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt={previewDoc.name} className="max-h-80 w-full object-contain" />
                  )}
                </div>
              )}

              <div className="space-y-2 text-[13px]">
                <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span className="text-muted-foreground">קטגוריה</span>
                  <span className="font-medium text-foreground">{previewDoc.category}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span className="text-muted-foreground">גודל</span>
                  <span className="font-medium text-foreground">{formatFileSize(previewDoc.file_size)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span className="text-muted-foreground">תאריך העלאה</span>
                  <span className="font-medium text-foreground">{formatDate(previewDoc.created_at)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span className="text-muted-foreground">סטטוס</span>
                  <Badge variant={DOCUMENT_STATUS_META[previewDoc.status].variant} className="text-[10px]">
                    {DOCUMENT_STATUS_META[previewDoc.status].label}
                  </Badge>
                </div>
                {previewDoc.notes && (
                  <div className="rounded-lg border border-border px-3 py-2">
                    <p className="text-muted-foreground">הערות</p>
                    <p className="mt-1 text-foreground">{previewDoc.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => handleDownload(previewDoc)}>
                  <Download className="h-4 w-4" />
                  הורדה
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="מחיקת מסמך"
        description={`האם אתם בטוחים שברצונכם למחוק את "${deleteTarget?.name ?? ""}"? לא ניתן לשחזר פעולה זו.`}
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
