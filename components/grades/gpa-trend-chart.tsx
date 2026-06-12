"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeSemesterAverages } from "@/lib/academics";

export function GpaTrendChart() {
  const data = computeSemesterAverages();

  return (
    <Card className="animate-fade-in">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-[14px]">מגמת ממוצע ציונים</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="semester"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748B", fontSize: 12 }}
            />
            <YAxis
              domain={[60, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748B", fontSize: 12 }}
              width={36}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                boxShadow: "0 4px 16px -4px rgb(15 23 42 / 0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey="average"
              name="ממוצע סמסטריאלי"
              stroke="#4F46E5"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="cumulativeAverage"
              name="ממוצע מצטבר"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
