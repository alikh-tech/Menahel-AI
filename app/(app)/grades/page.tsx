import type { Metadata } from "next";

import { GradesSummaryCards } from "@/components/grades/grades-summary-cards";
import { GpaTrendChart } from "@/components/grades/gpa-trend-chart";
import { GradesTable } from "@/components/grades/grades-table";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeAcademicStats } from "@/lib/academics";

export const metadata: Metadata = {
  title: "ציונים | מנהל.AI",
};

export default function GradesPage() {
  const { creditsEarned, creditsRequired } = computeAcademicStats();
  const degreeProgress = Math.round((creditsEarned / creditsRequired) * 100);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">ציונים והתקדמות אקדמית</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          סיכום הציונים, נקודות הזכות והתקדמותך לקראת התואר
        </p>
      </div>

      <GradesSummaryCards />

      <Card className="animate-fade-in">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-[14px]">התקדמות לתואר</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="mb-1.5 flex items-center justify-between text-[12px] text-muted-foreground">
            <span>{creditsEarned} מתוך {creditsRequired} נקודות זכות</span>
            <span>{degreeProgress}%</span>
          </div>
          <Progress value={degreeProgress} />
        </CardContent>
      </Card>

      <GpaTrendChart />

      <GradesTable />
    </div>
  );
}
