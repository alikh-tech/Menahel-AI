import { redirect } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { createClient } from "@/lib/supabase/server";
import { buildNotificationCandidates, syncNotifications, sortNotifications } from "@/lib/notifications";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const candidates = buildNotificationCandidates({
    transactions: transactions ?? [],
    documents: documents ?? [],
  });
  await syncNotifications(supabase, user.id, candidates);

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id);

  const userName =
    profile?.full_name || (user.user_metadata?.full_name as string) || "סטודנט";
  const userEmail = profile?.email || user.email || "";

  const documentsCount = documents?.length ?? 0;
  const pendingCount =
    documents?.filter((doc) => doc.status === "in_review" || doc.status === "needs_correction").length ?? 0;
  const recentDocuments = documents?.slice(0, 4) ?? [];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        profile={profile}
        recentDocuments={recentDocuments}
        documentsCount={documentsCount}
        pendingCount={pendingCount}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          userName={userName}
          userEmail={userEmail}
          avatarUrl={profile?.avatar_url}
          institution={profile?.institution}
          academicYear={profile?.academic_year}
          notifications={sortNotifications(notifications ?? [])}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
