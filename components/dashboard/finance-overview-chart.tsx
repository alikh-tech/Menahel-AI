"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/utils";

interface ChartPoint {
  month: string;
  income: number;
  expenses: number;
}

export function FinanceOverviewChart({ data }: { data: ChartPoint[] }) {
  if (data.every((d) => d.income === 0 && d.expenses === 0)) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        אין עדיין נתוני כספים להצגה. הוסיפו תנועות במרכז הכספים.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#64748B", fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#64748B", fontSize: 12 }}
          tickFormatter={(value) => `₪${value}`}
          width={60}
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #E5E7EB",
            boxShadow: "0 4px 16px -4px rgb(15 23 42 / 0.1)",
          }}
        />
        <Area
          type="monotone"
          dataKey="income"
          name="הכנסות"
          stroke="#4F46E5"
          fill="url(#income)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="expenses"
          name="הוצאות"
          stroke="#F59E0B"
          fill="url(#expenses)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
