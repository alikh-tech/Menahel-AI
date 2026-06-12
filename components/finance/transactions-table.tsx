"use client";

import { useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, CreditCard, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaymentModal } from "@/components/finance/payment-modal";
import { createClient } from "@/lib/supabase/client";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/types";

const TYPE_LABEL: Record<Transaction["type"], string> = {
  income: "הכנסה",
  expense: "הוצאה",
  debt: "חוב",
  payment: "תשלום",
};

const TYPE_VARIANT: Record<Transaction["type"], "success" | "destructive" | "warning" | "default"> = {
  income: "success",
  expense: "destructive",
  debt: "warning",
  payment: "default",
};

const TYPE_ICON: Record<Transaction["type"], typeof ArrowDownCircle> = {
  income: ArrowDownCircle,
  expense: ArrowUpCircle,
  debt: Wallet,
  payment: CreditCard,
};

const TYPE_ICON_STYLE: Record<Transaction["type"], { bg: string; color: string }> = {
  income: { bg: "#ECFDF5", color: "#10B981" },
  expense: { bg: "#FEF2F2", color: "#EF4444" },
  debt: { bg: "#FFFBEB", color: "#D97706" },
  payment: { bg: "#EEF2FF", color: "#4F46E5" },
};

const STATUS_LABEL: Record<Transaction["status"], string> = {
  completed: "הושלם",
  pending: "ממתין",
  scheduled: "מתוזמן",
};

export function TransactionsTable({
  transactions,
  onDelete,
  onUpdate,
}: {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onUpdate?: (transaction: Transaction) => void;
}) {
  const [payingTransaction, setPayingTransaction] = useState<Transaction | null>(null);

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (error) {
      toast.error("שגיאה במחיקת התנועה");
      return;
    }

    onDelete(id);
    toast.success("התנועה נמחקה");
  }

  return (
    <Card>
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Wallet className="h-10 w-10 text-muted-foreground/40" />
            <div>
              <p className="text-[13px] font-semibold text-foreground">אין תנועות כספיות</p>
              <p className="text-[12px] text-muted-foreground">
                הוסיפו הכנסה, הוצאה או חוב כדי להתחיל לעקוב
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((t, i) => {
              const canPay =
                (t.type === "debt" || t.type === "payment") &&
                (t.status === "pending" || t.status === "scheduled");
              const isPositive = t.type === "income" || t.type === "payment";
              const Icon = TYPE_ICON[t.type];
              const iconStyle = TYPE_ICON_STYLE[t.type];

              return (
                <div
                  key={t.id}
                  className="flex animate-fade-in items-center gap-3 px-4 py-3 transition-colors hover:bg-accent"
                  style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: iconStyle.bg }}
                  >
                    <Icon className="h-[18px] w-[18px]" style={{ color: iconStyle.color }} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-foreground">{t.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">{t.category}</span>
                      <Badge variant={TYPE_VARIANT[t.type]} className="text-[10px]">
                        {TYPE_LABEL[t.type]}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {STATUS_LABEL[t.status]}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDate(t.due_date || t.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className={cn("text-[14px] font-bold", isPositive ? "text-success" : "text-destructive")}>
                      {isPositive ? "+" : "-"}
                      {formatCurrency(t.amount)}
                    </span>
                    <div className="flex items-center gap-1">
                      {canPay && (
                        <Button
                          size="sm"
                          className="h-7 rounded-lg text-[11px]"
                          onClick={() => setPayingTransaction(t)}
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          שלם עכשיו
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(t.id)}
                        className="h-7 w-7 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <PaymentModal
        transaction={payingTransaction}
        onClose={() => setPayingTransaction(null)}
        onPaid={(updated) => onUpdate?.(updated)}
      />
    </Card>
  );
}
