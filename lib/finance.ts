import type { Transaction } from "@/types";

export const MONTH_LABELS = [
  "ינו",
  "פבר",
  "מרץ",
  "אפר",
  "מאי",
  "יוני",
  "יולי",
  "אוג",
  "ספט",
  "אוק",
  "נוב",
  "דצמ",
];

export interface MonthlyFinancePoint {
  month: string;
  income: number;
  expenses: number;
}

export function buildMonthlySeries(transactions: Transaction[]): MonthlyFinancePoint[] {
  const now = new Date();
  const months: MonthlyFinancePoint[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ month: MONTH_LABELS[d.getMonth()], income: 0, expenses: 0 });
  }

  for (const t of transactions) {
    const d = new Date(t.created_at);
    const monthsAgo =
      (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (monthsAgo < 0 || monthsAgo > 5) continue;
    const idx = 5 - monthsAgo;
    if (t.type === "income" || t.type === "payment") {
      months[idx].income += t.amount;
    } else {
      months[idx].expenses += t.amount;
    }
  }

  return months;
}
