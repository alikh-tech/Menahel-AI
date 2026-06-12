import Link from "next/link";
import { ChevronLeft, GraduationCap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { TuitionSummary } from "@/lib/tuition";

export function TuitionStatusCard({ summary }: { summary: TuitionSummary }) {
  const progressPercent = summary.total > 0 ? Math.round((summary.paid / summary.total) * 100) : 0;

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-[14px]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "#EEF2FF" }}>
            <GraduationCap className="h-4 w-4" style={{ color: "#4F46E5" }} />
          </div>
          שכר לימוד
        </CardTitle>
        <Link
          href="/finance"
          className="flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
        >
          הכל
          <ChevronLeft className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-2.5 p-4 pt-0">
        <div>
          <Progress value={progressPercent} />
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{progressPercent}% שולם</span>
            <span>נותר {formatCurrency(summary.remaining)}</span>
          </div>
        </div>

        {summary.nextInstallment && (
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-[12px]">
            <span className="text-muted-foreground">תשלום הבא</span>
            <span className="font-semibold text-foreground">
              {formatCurrency(summary.nextInstallment.amount)} ·{" "}
              {formatDate(summary.nextInstallment.due_date || summary.nextInstallment.created_at)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
