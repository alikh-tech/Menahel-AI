import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { FinanceClient } from "@/components/finance/finance-client";

export const metadata: Metadata = {
  title: "מרכז כספים | מנהל.AI",
};

export default async function FinancePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return <FinanceClient initialTransactions={transactions ?? []} />;
}
