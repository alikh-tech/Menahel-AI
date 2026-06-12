import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { AcademicSummaryCards } from "@/components/dashboard/academic-summary-card";
import { FinanceOverviewChart } from "@/components/dashboard/finance-overview-chart";
import { DocumentStatusCard } from "@/components/dashboard/document-status-card";
import { TuitionStatusCard } from "@/components/dashboard/tuition-status-card";
import { NotificationsPreviewCard } from "@/components/dashboard/notifications-preview-card";
import { UpcomingExamsCard } from "@/components/dashboard/upcoming-exams-card";
import { UpcomingAssignmentsCard } from "@/components/dashboard/upcoming-assignments-card";
import { ActiveRequestsCard } from "@/components/dashboard/active-requests-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildMonthlySeries } from "@/lib/finance";
import { getTuitionTransactions, summarizeTuition } from "@/lib/tuition";
import { buildNotificationCandidates, syncNotifications, sortNotifications } from "@/lib/notifications";

export const metadata: Metadata = {
  title: "לוח בקרה | מנהל.AI",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profileRes, transactionsRes, documentsRes, requestsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("documents")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("requests")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
  ]);

  const profile = profileRes.data;
  const transactions = transactionsRes.data ?? [];
  const documents = documentsRes.data ?? [];
  const requests = requestsRes.data ?? [];

  const monthlySeries = buildMonthlySeries(transactions);

  const tuitionSummary = summarizeTuition(getTuitionTransactions(transactions));

  const candidates = buildNotificationCandidates({ transactions, documents });
  await syncNotifications(supabase, user!.id, candidates);
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user!.id);

  const firstName = (profile?.full_name || "סטודנט").split(" ")[0];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          שלום, {firstName} 👋
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          הנה סיכום מהיר של המצב האקדמי שלך
        </p>
      </div>

      <AcademicSummaryCards />

      <div className="animate-fade-in [animation-delay:150ms]">
        <NotificationsPreviewCard notifications={sortNotifications(notifications ?? [])} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="animate-fade-in [animation-delay:200ms]">
          <UpcomingExamsCard />
        </div>
        <div className="animate-fade-in [animation-delay:250ms]">
          <UpcomingAssignmentsCard />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="animate-fade-in [animation-delay:300ms]">
          <DocumentStatusCard documents={documents} />
        </div>
        <div className="animate-fade-in [animation-delay:350ms]">
          <TuitionStatusCard summary={tuitionSummary} />
        </div>
        <div className="animate-fade-in [animation-delay:400ms]">
          <ActiveRequestsCard requests={requests} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="animate-fade-in [animation-delay:400ms]">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-[14px]">תזרים כספי - 6 חודשים אחרונים</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <FinanceOverviewChart data={monthlySeries} />
          </CardContent>
        </Card>

        <Card
          className="relative animate-fade-in overflow-hidden border-0 text-white [animation-delay:450ms]"
          style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}
        >
          <CardContent className="space-y-3 p-5">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-[15px] font-bold">עוזר ה-AI שלך</h3>
            <p className="text-[12px] leading-relaxed text-white/80">
              יש לך שאלה לגבי לימודים, מלגות, תשלומים או מסמכים? עוזר ה-AI
              שלנו זמין לעזור בכל רגע.
            </p>
            <Link
              href="/ai-assistant"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white px-4 text-[12px] font-semibold text-primary shadow-sm transition-all hover:bg-white/90 active:scale-95"
            >
              פתחו שיחה חדשה
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
