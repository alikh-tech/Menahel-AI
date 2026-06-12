import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { buildNotificationCandidates, syncNotifications, sortNotifications } from "@/lib/notifications";
import { NotificationsClient } from "@/components/notifications/notifications-client";

export const metadata: Metadata = {
  title: "התראות | מנהל.AI",
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [transactionsRes, documentsRes] = await Promise.all([
    supabase.from("transactions").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
    supabase.from("documents").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
  ]);

  const candidates = buildNotificationCandidates({
    transactions: transactionsRes.data ?? [],
    documents: documentsRes.data ?? [],
  });
  await syncNotifications(supabase, user!.id, candidates);

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user!.id);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">התראות</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          כל ההתראות החשובות לגבי הלימודים, התשלומים והמסמכים שלך
        </p>
      </div>

      <NotificationsClient initialNotifications={sortNotifications(notifications ?? [])} />
    </div>
  );
}
