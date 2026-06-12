import { ADDITIONAL_CHARGES, TUITION_CONFIG } from "@/lib/constants";
import type { Database } from "@/types/database.types";
import type { Transaction } from "@/types";

const ADDITIONAL_CHARGE_CATEGORIES = new Set<string>(ADDITIONAL_CHARGES.map((c) => c.category));

type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];

export interface TuitionSummary {
  total: number;
  paid: number;
  remaining: number;
  nextInstallment: Transaction | null;
  schedule: Transaction[];
}

function offsetDate(monthsOffset: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setMonth(date.getMonth() + monthsOffset);
  return date.toISOString().slice(0, 10);
}

export function getTuitionTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.filter((t) => t.category === TUITION_CONFIG.category && t.type === "payment");
}

/**
 * System-generated additional charges (e.g. חידוש כרטיס סטודנט, דמי טיפול,
 * קנס איחור). Students cannot create these themselves - they only appear
 * if already present in the database.
 */
export function getAdditionalCharges(transactions: Transaction[]): Transaction[] {
  return transactions.filter((t) => ADDITIONAL_CHARGE_CATEGORIES.has(t.category) && t.type === "payment");
}

export function buildTuitionSeed(userId: string): TransactionInsert[] {
  const seed: TransactionInsert[] = [];

  for (let i = 1; i <= TUITION_CONFIG.installments; i++) {
    const isPaid = i <= TUITION_CONFIG.paidByDefault;
    const monthsOffset = i - (TUITION_CONFIG.paidByDefault + 1);

    seed.push({
      user_id: userId,
      title: `שכר לימוד - תשלום ${i} מתוך ${TUITION_CONFIG.installments}`,
      category: TUITION_CONFIG.category,
      amount: TUITION_CONFIG.perInstallment,
      type: "payment",
      status: isPaid ? "completed" : i === TUITION_CONFIG.paidByDefault + 1 ? "pending" : "scheduled",
      due_date: offsetDate(monthsOffset),
    });
  }

  return seed;
}

export function summarizeTuition(tuitionTransactions: Transaction[]): TuitionSummary {
  const sorted = [...tuitionTransactions].sort((a, b) => {
    const dateA = a.due_date ?? a.created_at;
    const dateB = b.due_date ?? b.created_at;
    return dateA.localeCompare(dateB);
  });

  // The tuition plan always consists of exactly TUITION_CONFIG.installments
  // rows. If duplicates exist in the database, only the first N (by due date)
  // are treated as the canonical schedule.
  const schedule = sorted.slice(0, TUITION_CONFIG.installments);

  const paid = schedule
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const total = TUITION_CONFIG.total;

  const nextInstallment = schedule.find((t) => t.status !== "completed") ?? null;

  return {
    total,
    paid,
    remaining: total - paid,
    nextInstallment,
    schedule,
  };
}
