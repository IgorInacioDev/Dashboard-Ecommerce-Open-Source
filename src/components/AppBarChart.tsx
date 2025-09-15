"use client";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  google: {
    label: "Google",
    color: "var(--chart-3)",
  },
  facebook: {
    label: "Facebook",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const chartData = [
  { month: "Hoje", google: 186, facebook: 80 },
  { month: "Ontem", google: 305, facebook: 200 },
  { month: "28/09", google: 237, facebook: 120 },
  { month: "27/09", google: 73, facebook: 190 },
  { month: "26/09", google: 209, facebook: 130 },
  { month: "25/09", google: 214, facebook: 140 },
  { month: "24/09", google: 214, facebook: 140 },
];

const AppBarChart = () => {
  return (
    <div className="">
      <h1 className="text-lg font-medium mb-6">ADS Fonts</h1>
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false as const}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="google" fill="var(--color-google)" radius={4} />
          <Bar dataKey="facebook" fill="var(--color-facebook)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default AppBarChart;
