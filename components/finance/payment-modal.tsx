"use client";

import { useState } from "react";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfettiOverlay } from "@/components/finance/confetti-overlay";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/types";

interface PaymentModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onPaid: (transaction: Transaction) => void;
}

export function PaymentModal({ transaction, onClose, onPaid }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  async function handleConfirm() {
    if (!transaction) return;

    setLoading(true);
    const supabase = createClient();

    const { data: updated, error } = await supabase
      .from("transactions")
      .update({ status: "completed" })
      .eq("id", transaction.id)
      .select()
      .single();

    setLoading(false);

    if (error || !updated) {
      toast.error("שגיאה בביצוע התשלום");
      return;
    }

    setShowConfetti(true);
    toast.success("התשלום בוצע בהצלחה");
    onPaid(updated);

    setTimeout(() => {
      setShowConfetti(false);
      onClose();
    }, 1800);
  }

  return (
    <>
      {showConfetti && <ConfettiOverlay />}
      <Dialog open={!!transaction} onOpenChange={(open) => !open && !loading && onClose()}>
        <DialogContent>
          {transaction && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
                    style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}
                  >
                    <CreditCard className="h-4 w-4" />
                  </div>
                  אישור תשלום
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-background p-4 text-center">
                  <p className="text-[12px] text-muted-foreground">{transaction.title}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {transaction.category} · יעד תשלום: {formatDate(transaction.due_date || transaction.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-foreground">כרטיס אשראי שמור</p>
                    <p className="text-[11px] text-muted-foreground">**** **** **** 4242</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-success" />
                  התשלום מאובטח ומוצפן
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
                  ביטול
                </Button>
                <Button className="flex-1" onClick={handleConfirm} disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  שלם עכשיו
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
