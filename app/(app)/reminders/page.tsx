import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { RemindersClient } from "@/components/reminders/reminders-client";

export const metadata: Metadata = {
  title: "תזכורות | מנהל.AI",
};

export default async function RemindersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: reminders } = await supabase
    .from("reminders")
    .select("*")
    .eq("user_id", user!.id)
    .order("due_date", { ascending: true });

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user!.id);

  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", user!.id);

  return (
    <RemindersClient
      initialReminders={reminders ?? []}
      transactions={transactions ?? []}
      documents={documents ?? []}
    />
  );
}
