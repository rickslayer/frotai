'use client';

import type { FC } from 'react';
import { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts';
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
import { useTranslation } from 'react-i18next';

interface TopModelsChartProps {
  data: Sale[];
}

const TopModelsChart: FC<TopModelsChartProps> = ({ data }) => {
  const { t } = useTranslation();

  const chartConfig = {
    sales: {
      label: t('sales'),
      color: 'hsl(var(--accent))',
    },
  } satisfies ChartConfig;

  const chartData = useMemo(() => {
    const modelSales = data.reduce((acc, item) => {
      const key = `${item.manufacturer} ${item.model}`;
      acc[key] = (acc[key] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(modelSales)
      .map(([model, sales]) => ({ model, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 7) // Top 7
      .reverse();

  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('top_selling_models')}</CardTitle>
        <CardDescription>{t('top_selling_models_description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
           {chartData.length > 0 ? (
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 10,
              right: 10,
            }}
          >
            <YAxis
              dataKey="model"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 15) + (value.length > 15 ? '...' : '')}
              width={100}
            />
            <XAxis dataKey="sales" type="number" hide />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="sales" layout="vertical" radius={5} fill="var(--color-sales)" />
          </BarChart>
          ) : (
            <div className="flex h-[300px] w-full items-center justify-center text-muted-foreground">
              {t('no_data_available')}
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TopModelsChart;
