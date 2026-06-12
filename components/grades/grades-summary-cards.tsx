import { Award, BookOpen, GraduationCap, TrendingUp } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { DEMO_COURSES } from "@/lib/constants";
import { computeAcademicStats } from "@/lib/academics";

export function GradesSummaryCards() {
  const { average, creditsEarned, creditsRequired, activeCourses } = computeAcademicStats();
  const degreeProgress = Math.round((creditsEarned / creditsRequired) * 100);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="animate-fade-in">
        <StatCard
          title="ממוצע אקדמי"
          value={average}
          icon={TrendingUp}
          iconBg="#ECFDF5"
          iconColor="#10B981"
        />
      </div>
      <div className="animate-fade-in [animation-delay:50ms]">
        <StatCard
          title="נקודות זכות"
          value={`${creditsEarned} / ${creditsRequired}`}
          icon={Award}
          iconBg="#EEF2FF"
          iconColor="#4F46E5"
        />
      </div>
      <div className="animate-fade-in [animation-delay:100ms]">
        <StatCard
          title="התקדמות לתואר"
          value={`${degreeProgress}%`}
          icon={GraduationCap}
          iconBg="#F5F3FF"
          iconColor="#7C3AED"
        />
      </div>
      <div className="animate-fade-in [animation-delay:150ms]">
        <StatCard
          title="קורסים שהושלמו"
          value={String(DEMO_COURSES.length)}
          icon={BookOpen}
          iconBg="#FFFBEB"
          iconColor="#D97706"
        />
      </div>
    </div>
  );
}
