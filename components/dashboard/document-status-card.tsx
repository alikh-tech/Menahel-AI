import Link from "next/link";
import { ChevronLeft, FileSearch, FileWarning, FileCheck2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DocumentRow } from "@/types";

export function DocumentStatusCard({ documents }: { documents: DocumentRow[] }) {
  const counts = {
    needs_correction: documents.filter((d) => d.status === "needs_correction").length,
    in_review: documents.filter((d) => d.status === "in_review").length,
    approved: documents.filter((d) => d.status === "approved").length,
  };

  const rows = [
    {
      key: "needs_correction" as const,
      label: "דורשים תיקון",
      icon: FileWarning,
      iconBg: "#FEF2F2",
      iconColor: "#EF4444",
    },
    {
      key: "in_review" as const,
      label: "בבדיקה",
      icon: FileSearch,
      iconBg: "#FFFBEB",
      iconColor: "#D97706",
    },
    {
      key: "approved" as const,
      label: "אושרו",
      icon: FileCheck2,
      iconBg: "#ECFDF5",
      iconColor: "#10B981",
    },
  ];

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <CardTitle className="text-[14px]">סטטוס מסמכים</CardTitle>
        <Link
          href="/documents"
          className="flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
        >
          הכל
          <ChevronLeft className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-2 p-4 pt-0">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div key={row.key} className="flex flex-col items-center gap-2 rounded-xl border border-border p-3 text-center">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ background: row.iconBg }}
              >
                <Icon className="h-4 w-4" style={{ color: row.iconColor }} />
              </div>
              <p className="text-lg font-bold text-foreground">{counts[row.key]}</p>
              <p className="text-[11px] text-muted-foreground">{row.label}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
