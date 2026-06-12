import Link from "next/link";
import { Award, GraduationCap, Files, ClipboardCheck } from "lucide-react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { getDocumentMeta } from "@/lib/document-meta";
import { computeAcademicStats } from "@/lib/academics";
import { getInitials } from "@/lib/utils";
import type { DocumentRow, Profile } from "@/types";

interface SidebarProps {
  profile: Profile | null;
  recentDocuments: DocumentRow[];
  documentsCount: number;
  pendingCount: number;
}

export function Sidebar({
  profile,
  recentDocuments,
  documentsCount,
  pendingCount,
}: SidebarProps) {
  const fullName = profile?.full_name || "סטודנט";
  const fieldOfStudy = profile?.field_of_study || "סטודנט/ית";
  const academicStats = computeAcademicStats();

  const kpis = [
    {
      label: "ממוצע אקדמי",
      value: academicStats.average,
      icon: Award,
      color: "#4F46E5",
      bg: "#EEF2FF",
    },
    {
      label: "נקודות זכות",
      value: `${academicStats.creditsEarned}/${academicStats.creditsRequired}`,
      icon: GraduationCap,
      color: "#10B981",
      bg: "#ECFDF5",
    },
    {
      label: "מסמכים זמינים",
      value: String(documentsCount),
      icon: Files,
      color: "#7C3AED",
      bg: "#F5F3FF",
    },
    {
      label: "בקשות פתוחות",
      value: String(pendingCount),
      icon: ClipboardCheck,
      color: "#D97706",
      bg: "#FFFBEB",
    },
  ];

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-l border-border bg-card lg:flex">
      {/* Brand + student card */}
      <div className="border-b border-border px-4 py-4">
        <Link href="/dashboard" className="mb-3 flex items-center gap-2">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black text-white"
            style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)", boxShadow: "0 2px 8px rgba(79,70,229,0.30)" }}
          >
            מ
          </div>
          <span className="text-base font-black text-foreground">
            מנהל<span className="text-primary">.</span>AI
          </span>
          <span className="mr-auto rounded-full border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-primary">
            BETA
          </span>
        </Link>

        <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-2.5">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white"
            style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}
          >
            {getInitials(fullName).slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold leading-none text-foreground">
              {fullName}
            </p>
            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
              {fieldOfStudy}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pt-3 pb-2">
        <div>
          <p className="px-4 pb-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
            ניווט ראשי
          </p>
          <SidebarNav />
        </div>

        {recentDocuments.length > 0 && (
          <div>
            <p className="px-4 pb-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
              מסמכים אחרונים
            </p>
            <div className="flex flex-col gap-0.5 px-2">
              {recentDocuments.map((doc) => {
                const meta = getDocumentMeta(doc.category);
                const Icon = meta.icon;
                return (
                  <Link
                    key={doc.id}
                    href="/documents"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-medium text-muted-foreground transition-all hover:bg-accent"
                  >
                    <div
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded"
                      style={{ background: meta.iconBg }}
                    >
                      <Icon size={9} style={{ color: meta.iconColor }} />
                    </div>
                    <span className="truncate">{doc.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* KPI grid */}
      <div className="border-t border-border px-3 pb-4 pt-3">
        <p className="px-1 pb-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
          סטטוס אקדמי
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className="rounded-xl border border-border bg-background p-2.5"
              >
                <div
                  className="mb-1.5 flex h-6 w-6 items-center justify-center rounded-lg"
                  style={{ background: kpi.bg }}
                >
                  <Icon size={11} style={{ color: kpi.color }} />
                </div>
                <p className="text-sm font-bold leading-none text-foreground">
                  {kpi.value}
                </p>
                <p className="mt-0.5 text-[9px] leading-tight text-muted-foreground">
                  {kpi.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
