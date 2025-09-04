'use client';

import type { FC } from 'react';
import { useMemo } from 'react';
import { format, parseISO, startOfMonth } from 'date-fns';
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { Sale } from '@/types';

interface SalesOverTimeChartProps {
  data: Sale[];
}

const chartConfig = {
  sales: {
    label: 'Sales',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const SalesOverTimeChart: FC<SalesOverTimeChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const monthlySales = data.reduce((acc, item) => {
      const month = format(startOfMonth(parseISO(item.date)), 'MMM yyyy');
      acc[month] = (acc[month] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlySales)
      .map(([month, sales]) => ({ month, sales }))
      .sort((a, b) => parseISO(a.month).getTime() - parseISO(b.month).getTime());

  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Progression</CardTitle>
        <CardDescription>Showing total vehicle sales over the selected period.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Line
                dataKey="sales"
                type="natural"
                stroke="var(--color-sales)"
                strokeWidth={2}
                dot={true}
              />
            </LineChart>
          ) : (
            <div className="flex h-[300px] w-full items-center justify-center text-muted-foreground">
              No data available for the selected filters.
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SalesOverTimeChart;
