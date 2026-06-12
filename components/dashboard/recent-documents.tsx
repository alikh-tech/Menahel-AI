import Link from "next/link";
import { FileText, ChevronLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDocumentMeta } from "@/lib/document-meta";
import { DOCUMENT_STATUS_META } from "@/lib/constants";
import type { DocumentRow } from "@/types";
import { formatDate } from "@/lib/utils";

export function RecentDocuments({ documents }: { documents: DocumentRow[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <CardTitle className="text-[14px]">מסמכים אחרונים</CardTitle>
        <Link
          href="/documents"
          className="flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
        >
          הכל
          <ChevronLeft className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-1 p-4 pt-0">
        {documents.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <FileText className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-[12px] text-muted-foreground">
              עדיין לא הועלו מסמכים
            </p>
          </div>
        ) : (
          documents.map((doc) => {
            const meta = getDocumentMeta(doc.category);
            const Icon = meta.icon;
            return (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-accent"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: meta.iconBg }}
                  >
                    <Icon className="h-4 w-4" style={{ color: meta.iconColor }} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-semibold text-foreground">
                      {doc.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {doc.category} · {formatDate(doc.created_at)}
                    </p>
                  </div>
                </div>
                <Badge variant={DOCUMENT_STATUS_META[doc.status].variant} className="shrink-0 text-[10px]">
                  {DOCUMENT_STATUS_META[doc.status].label}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
