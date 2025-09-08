'use client';

import type { FC } from 'react';
import { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, LabelList } from 'recharts';
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
import type { Vehicle } from '@/types';
import { useTranslation } from 'react-i18next';

interface TopModelsChartProps {
  data: Vehicle[];
}

const TopModelsChart: FC<TopModelsChartProps> = ({ data }) => {
  const { t } = useTranslation();

  const chartConfig = {
    quantity: {
      label: t('quantity'),
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
      .map(([model, quantity]) => ({ model, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [data]);

  return (
    <Card className="xl:col-span-1">
      <CardHeader>
        <CardTitle>{t('top_models_by_volume')}</CardTitle>
        <CardDescription>{t('top_models_by_volume_description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          {chartData.length > 0 ? (
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{
                left: 10,
                right: 10,
                top: 10,
                bottom: 10,
              }}
            >
              <YAxis dataKey="model" type="category" hide />
              <XAxis dataKey="quantity" type="number" hide />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent />}
              />
              <Bar dataKey="quantity" layout="vertical" radius={5} fill="var(--color-quantity)">
                <LabelList
                  dataKey="model"
                  position="insideLeft"
                  offset={8}
                  className="fill-primary-foreground text-sm font-medium"
                  formatter={(value: string) => value.slice(0, 25) + (value.length > 25 ? '...' : '')}
                />
              </Bar>
            </BarChart>
          ) : (
            <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">
              {t('no_data_available')}
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TopModelsChart;
