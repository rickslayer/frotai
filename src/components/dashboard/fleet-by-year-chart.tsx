'use client';

import type { FC } from 'react';
import { useMemo } from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
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

interface FleetAnalysisProps {
  data: Vehicle[];
}

const FleetAnalysis: FC<FleetAnalysisProps> = ({ data }) => {
  const { t } = useTranslation();

  const chartConfig = {
    quantity: {
      label: t('quantity'),
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig;

  const chartData = useMemo(() => {
    const yearlyFleet = data.reduce((acc, item) => {
      acc[item.year] = (acc[item.year] || 0) + item.quantity;
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(yearlyFleet)
      .map(([year, quantity]) => ({ year: parseInt(year), quantity }))
      .sort((a, b) => a.year - b.year);
  }, [data]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{t('fleet_by_year')}</CardTitle>
        <CardDescription>{t('fleet_by_year_description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          {chartData.length > 0 ? (
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 20, left: 12, right: 12, bottom: 5 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => String(value)}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Line
                dataKey="quantity"
                type="natural"
                stroke="var(--color-quantity)"
                strokeWidth={2}
                dot={true}
              />
            </LineChart>
          ) : (
            <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">
              {t('no_data_for_filters')}
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default FleetAnalysis;
