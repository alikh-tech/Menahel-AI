import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { RequestsClient } from "@/components/requests/requests-client";

export const metadata: Metadata = {
  title: "בקשות | מנהל.AI",
};

export default async function RequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: requests } = await supabase
    .from("requests")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return <RequestsClient initialRequests={requests ?? []} />;
}
