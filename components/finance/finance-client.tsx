"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TrendingDown, TrendingUp, Wallet, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { StatCard } from "@/components/dashboard/stat-card";
import { FinanceOverviewChart } from "@/components/dashboard/finance-overview-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionsTable } from "@/components/finance/transactions-table";
import { TuitionOverview } from "@/components/finance/tuition-overview";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { buildMonthlySeries } from "@/lib/finance";
import { TUITION_CONFIG } from "@/lib/constants";
import { buildTuitionSeed, getAdditionalCharges, getTuitionTransactions } from "@/lib/tuition";
import type { Transaction } from "@/types";

export function FinanceClient({ initialTransactions }: { initialTransactions: Transaction[] }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    let cancelled = false;

    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const tuitionRows = getTuitionTransactions(transactions);

      if (tuitionRows.length > TUITION_CONFIG.installments) {
        // Remove duplicate installments created by earlier, non-idempotent
        // seeding - keep only the first TUITION_CONFIG.installments by due date.
        const sorted = [...tuitionRows].sort((a, b) => {
          const dateA = a.due_date ?? a.created_at;
          const dateB = b.due_date ?? b.created_at;
          return dateA.localeCompare(dateB);
        });
        const extraIds = sorted.slice(TUITION_CONFIG.installments).map((t) => t.id);

        const { error } = await supabase.from("transactions").delete().in("id", extraIds);

        if (cancelled) return;

        if (error) {
          toast.error("שגיאה בעדכון נתוני שכר הלימוד");
          return;
        }

        setTransactions((prev) => prev.filter((t) => !extraIds.includes(t.id)));
        return;
      }

      if (tuitionRows.length === 0) {
        const { data: inserted, error } = await supabase
          .from("transactions")
          .insert(buildTuitionSeed(user.id))
          .select();

        if (cancelled) return;

        if (error || !inserted) {
          toast.error("שגיאה בטעינת נתוני שכר הלימוד");
          return;
        }

        setTransactions((prev) => [...inserted, ...prev]);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tuitionTransactions = useMemo(() => getTuitionTransactions(transactions), [transactions]);
  const additionalCharges = useMemo(() => getAdditionalCharges(transactions), [transactions]);

  const stats = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income" || t.type === "payment")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const debt = transactions
      .filter((t) => t.type === "debt" && t.status !== "completed")
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expenses, balance: income - expenses, debt };
  }, [transactions]);

  const monthlySeries = useMemo(() => buildMonthlySeries(transactions), [transactions]);

  function handleUpdate(updated: Transaction) {
    setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">מרכז כספים</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          עקבו אחרי שכר הלימוד, התשלומים והחיובים שלכם
        </p>
      </div>

      <TuitionOverview
        tuitionTransactions={tuitionTransactions}
        additionalCharges={additionalCharges}
        onUpdate={handleUpdate}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-fade-in">
          <StatCard
            title="יתרה"
            value={formatCurrency(stats.balance)}
            icon={Wallet}
            trend={stats.balance >= 0 ? "up" : "down"}
            iconBg="#EEF2FF"
            iconColor="#4F46E5"
          />
        </div>
        <div className="animate-fade-in [animation-delay:50ms]">
          <StatCard
            title="הכנסות"
            value={formatCurrency(stats.income)}
            icon={TrendingUp}
            iconBg="#ECFDF5"
            iconColor="#10B981"
          />
        </div>
        <div className="animate-fade-in [animation-delay:100ms]">
          <StatCard
            title="הוצאות"
            value={formatCurrency(stats.expenses)}
            icon={TrendingDown}
            iconBg="#FEF2F2"
            iconColor="#EF4444"
          />
        </div>
        <div className="animate-fade-in [animation-delay:150ms]">
          <StatCard
            title="חוב פתוח"
            value={formatCurrency(stats.debt)}
            icon={AlertCircle}
            trend={stats.debt > 0 ? "down" : "neutral"}
            iconBg="#FFFBEB"
            iconColor="#D97706"
          />
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
          <TabsTrigger value="transactions">תנועות</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-5">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-[14px]">תזרים כספי - 6 חודשים אחרונים</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <FinanceOverviewChart data={monthlySeries} />
            </CardContent>
          </Card>
          <TransactionsTable
            transactions={transactions.slice(0, 5)}
            onDelete={(id) => setTransactions((prev) => prev.filter((t) => t.id !== id))}
            onUpdate={handleUpdate}
          />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionsTable
            transactions={transactions}
            onDelete={(id) => setTransactions((prev) => prev.filter((t) => t.id !== id))}
            onUpdate={handleUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
