"use client";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import { getWeeklyRevenue, WeeklyRevenueData } from "@/api/products";

const chartConfig = {
  paid: {
    label: "Paid",
    color: "#FDF9EF",
  },
  pending: {
    label: "Pending",
    color: "#645394",
  },
} satisfies ChartConfig;

// Static fallback data - últimos 7 dias
const fallbackData = [
  { day: "Seg 13/01", paid: 186, pending: 80 },
  { day: "Ter 14/01", paid: 305, pending: 200 },
  { day: "Qua 15/01", paid: 237, pending: 120 },
  { day: "Qui 16/01", paid: 173, pending: 190 },
  { day: "Sex 17/01", paid: 209, pending: 130 },
  { day: "Sáb 18/01", paid: 214, pending: 140 },
  { day: "Dom 19/01", paid: 155, pending: 95 },
];

// Função para formatar valores em reais
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Função para formatar valores grandes de forma simplificada (ex: 60k)
const formatCompactCurrency = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(0)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`;
  }
  return `${value.toFixed(0)}`;
};

const AppAreaChart = () => {
  const [chartData, setChartData] = useState<WeeklyRevenueData[]>(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
         setLoading(true);
         const data = await getWeeklyRevenue();
         console.log('Dados de receita semanal obtidos:', data);
         if (data.length > 0) {
           setChartData(data);
         } else {
           setChartData(fallbackData);
         }
      } catch (err) {
        console.error('Erro ao buscar dados de receita:', err);
        setError('Erro ao carregar dados');
        setChartData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col">
        <h1 className="ml-6 text-lg font-medium mb-6">Revenue</h1>
        <div className="w-full flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col">
        <h1 className="ml-6 text-lg font-medium mb-6">Revenue</h1>
        <div className="w-full flex-1 flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <h1 className="ml-6 text-lg font-medium mb-6">Revenue</h1>
      <ChartContainer config={chartConfig} className="w-full flex-1">
        <AreaChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis 
            tickLine={false} 
            tickMargin={10} 
            axisLine={false}
            tickFormatter={(value) => formatCompactCurrency(value)}
          />
          <ChartTooltip 
            content={<ChartTooltipContent 
              formatter={(value, name) => [
                formatCurrency(value as number), 
                name === 'paid' ? ' Pago' : ' Pendente'
              ]}
            />} 
          />
          <ChartLegend content={<ChartLegendContent />} />
          <defs>
            <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-paid)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-paid)"
                stopOpacity={0.1}
              />
            </linearGradient>
            <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-pending)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-pending)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <Area
            dataKey="pending"
            type="natural"
            fill="url(#fillMobile)"
            fillOpacity={0.4}
            stroke="var(--color-pending)"
            stackId="a"
          />
          <Area
            dataKey="paid"
            type="natural"
            fill="url(#fillDesktop)"
            fillOpacity={0.4}
            stroke="var(--color-paid)"
            stackId="a"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

export default AppAreaChart;
