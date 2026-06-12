import Link from "next/link";

import { Award, BookOpen, GraduationCap, TrendingUp } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { computeAcademicStats } from "@/lib/academics";

export function AcademicSummaryCards() {
  const { average, creditsEarned, creditsRequired, activeCourses } = computeAcademicStats();
  const degreeProgress = Math.round((creditsEarned / creditsRequired) * 100);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Link href="/grades" className="animate-fade-in">
        <StatCard
          title="ממוצע ציונים"
          value={average}
          icon={TrendingUp}
          iconBg="#ECFDF5"
          iconColor="#10B981"
        />
      </Link>
      <Link href="/grades" className="animate-fade-in [animation-delay:50ms]">
        <StatCard
          title="נקודות זכות"
          value={`${creditsEarned} / ${creditsRequired}`}
          icon={Award}
          iconBg="#EEF2FF"
          iconColor="#4F46E5"
        />
      </Link>
      <Link href="/grades" className="animate-fade-in [animation-delay:100ms]">
        <StatCard
          title="התקדמות לתואר"
          value={`${degreeProgress}%`}
          icon={GraduationCap}
          iconBg="#F5F3FF"
          iconColor="#7C3AED"
        />
      </Link>
      <Link href="/schedule" className="animate-fade-in [animation-delay:150ms]">
        <StatCard
          title="קורסים פעילים"
          value={String(activeCourses)}
          icon={BookOpen}
          iconBg="#FFFBEB"
          iconColor="#D97706"
        />
      </Link>
    </div>
  );
}
