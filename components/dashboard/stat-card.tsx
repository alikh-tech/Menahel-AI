import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  iconBg = "#EEF2FF",
  iconColor = "#4F46E5",
}: StatCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-soft">
      <CardContent className="flex items-start justify-between p-4">
        <div className="space-y-1.5">
          <p className="text-[12px] font-medium text-muted-foreground">{title}</p>
          <p className="text-xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {change && (
            <div
              className={cn(
                "flex items-center gap-1 text-[11px] font-medium",
                trend === "up" && "text-success",
                trend === "down" && "text-destructive",
                trend === "neutral" && "text-muted-foreground"
              )}
            >
              {trend === "up" && <ArrowUpRight className="h-3 w-3" />}
              {trend === "down" && <ArrowDownRight className="h-3 w-3" />}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: iconBg }}
        >
          <Icon className="h-[18px] w-[18px]" style={{ color: iconColor }} />
        </div>
      </CardContent>
    </Card>
  );
}
