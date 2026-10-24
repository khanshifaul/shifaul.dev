"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const fallbackData = [
  { name: "Mon", views: 2400, engagement: 400 },
  { name: "Tue", views: 1398, engagement: 300 },
  { name: "Wed", views: 9800, engagement: 2000 },
  { name: "Thu", views: 3908, engagement: 2780 },
  { name: "Fri", views: 4800, engagement: 1890 },
  { name: "Sat", views: 3800, engagement: 2390 },
  { name: "Sun", views: 4300, engagement: 3490 },
];

interface DashboardChartProps {
  data?: Array<{ name: string; views: number; engagement: number }>;
  timeRange?: string;
  onRangeChange?: (range: string) => void;
}

export function DashboardChart({ data = [], timeRange = '7d', onRangeChange }: DashboardChartProps) {
  const chartData = data.length > 0 ? data : fallbackData;
  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Analytics Overview</CardTitle>
          <CardDescription>
            Views and engagement over time.
          </CardDescription>
        </div>
        <select 
          value={timeRange} 
          onChange={(e) => onRangeChange?.(e.target.value)}
          className="text-sm border rounded-md p-1 bg-background"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="year">This Year</option>
        </select>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--background))", 
                borderColor: "hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))"
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Area
              type="monotone"
              dataKey="views"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorViews)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="engagement"
              stroke="#8b5cf6"
              fillOpacity={1}
              fill="url(#colorEngagement)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
