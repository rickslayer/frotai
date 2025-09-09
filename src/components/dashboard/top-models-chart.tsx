'use client';

import type { FC } from 'react';
import { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer } from 'recharts';
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
      .slice(0, 5);
  }, [data]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{t('top_models_by_volume')}</CardTitle>
        <CardDescription>{t('top_models_by_volume_description_short')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                accessibilityLayer
                data={chartData}
                layout="vertical"
                margin={{
                  left: 10,
                  right: 10,
                  top: 0,
                  bottom: 0,
                }}
              >
                <YAxis dataKey="model" type="category" hide />
                <XAxis dataKey="quantity" type="number" hide />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="quantity" layout="vertical" radius={5} barSize={35} fill="var(--color-quantity)">
                  <LabelList
                    dataKey="model"
                    position="insideLeft"
                    offset={8}
                    className="fill-primary-foreground text-sm font-medium"
                    formatter={(value: string) => value.slice(0, 25) + (value.length > 25 ? '...' : '')}
                  />
                   <LabelList 
                      dataKey="quantity" 
                      position="right"
                      offset={8}
                      className="fill-foreground font-semibold"
                      formatter={(value: number) => value.toLocaleString()}
                    />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] w-full items-center justify-center text-muted-foreground">
              {t('no_data_available')}
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TopModelsChart;
