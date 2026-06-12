"use client";

import { useState } from "react";
import { CreditCard, GraduationCap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PaymentModal } from "@/components/finance/payment-modal";
import { TUITION_CONFIG } from "@/lib/constants";
import { summarizeTuition } from "@/lib/tuition";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/types";

const STATUS_LABEL: Record<Transaction["status"], string> = {
  completed: "שולם",
  pending: "ממתין לתשלום",
  scheduled: "ממתין לתשלום",
};

const STATUS_VARIANT: Record<Transaction["status"], "success" | "warning" | "outline"> = {
  completed: "success",
  pending: "warning",
  scheduled: "warning",
};

interface TuitionOverviewProps {
  tuitionTransactions: Transaction[];
  additionalCharges: Transaction[];
  onUpdate: (transaction: Transaction) => void;
}

export function TuitionOverview({ tuitionTransactions, additionalCharges, onUpdate }: TuitionOverviewProps) {
  const [payingTransaction, setPayingTransaction] = useState<Transaction | null>(null);

  const summary = summarizeTuition(tuitionTransactions);
  const progressPercent = summary.total > 0 ? Math.round((summary.paid / summary.total) * 100) : 0;

  return (
    <Card className="animate-fade-in">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-[14px]">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "#EEF2FF" }}
          >
            <GraduationCap className="h-4 w-4" style={{ color: "#4F46E5" }} />
          </div>
          שכר לימוד
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-2">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border p-3">
            <p className="text-[11px] text-muted-foreground">סה&quot;כ שכר לימוד</p>
            <p className="mt-1 text-[16px] font-bold text-foreground">{formatCurrency(summary.total)}</p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="text-[11px] text-muted-foreground">שולם</p>
            <p className="mt-1 text-[16px] font-bold text-success">{formatCurrency(summary.paid)}</p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="text-[11px] text-muted-foreground">נותר לתשלום</p>
            <p className="mt-1 text-[16px] font-bold text-foreground">{formatCurrency(summary.remaining)}</p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="text-[11px] text-muted-foreground">תשלום הבא</p>
            <p className="mt-1 text-[16px] font-bold text-foreground">
              {summary.nextInstallment ? formatCurrency(summary.nextInstallment.amount) : "-"}
            </p>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-[12px] text-muted-foreground">
            <span>התקדמות תשלום שכר הלימוד</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} />
        </div>

        {summary.nextInstallment && (
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-accent/40 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[13px] font-semibold text-foreground">{summary.nextInstallment.title}</p>
              <p className="text-[11px] text-muted-foreground">
                לתשלום עד {formatDate(summary.nextInstallment.due_date || summary.nextInstallment.created_at)}
              </p>
            </div>
            <Button size="sm" onClick={() => setPayingTransaction(summary.nextInstallment)}>
              <CreditCard className="h-3.5 w-3.5" />
              שלם עכשיו
            </Button>
          </div>
        )}

        <div>
          <p className="mb-2 text-[12px] font-semibold text-foreground">לוח תשלומים</p>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {summary.schedule.map((t, i) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-[12px]"
              >
                <span className="text-muted-foreground">
                  תשלום {i + 1} מתוך {TUITION_CONFIG.installments}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{formatCurrency(t.amount)}</span>
                  <Badge variant={STATUS_VARIANT[t.status]} className="text-[10px]">
                    {STATUS_LABEL[t.status]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {additionalCharges.length > 0 && (
          <div>
            <p className="mb-2 text-[12px] font-semibold text-foreground">תשלומים נוספים</p>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {additionalCharges.map((charge) => (
                <div
                  key={charge.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-[12px]"
                >
                  <span className="text-muted-foreground">{charge.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{formatCurrency(charge.amount)}</span>
                    {charge.status === "completed" ? (
                      <Badge variant={STATUS_VARIANT[charge.status]} className="text-[10px]">
                        {STATUS_LABEL[charge.status]}
                      </Badge>
                    ) : (
                      <Button size="sm" className="h-7 text-[11px]" onClick={() => setPayingTransaction(charge)}>
                        <CreditCard className="h-3 w-3" />
                        שלם עכשיו
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <PaymentModal
        transaction={payingTransaction}
        onClose={() => setPayingTransaction(null)}
        onPaid={(updated) => {
          onUpdate(updated);
          setPayingTransaction(null);
        }}
      />
    </Card>
  );
}
