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
import { useTranslation } from 'react-i18next';
import { ptBR } from 'date-fns/locale';

const SalesOverTimeChart: FC<SalesOverTimeChartProps> = ({ data }) => {
  const { t, i18n } = useTranslation();

  const chartConfig = {
    sales: {
      label: t('sales'),
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig;

  const chartData = useMemo(() => {
    const monthlySales = data.reduce((acc, item) => {
      const monthDate = startOfMonth(parseISO(item.date));
      const monthKey = format(monthDate, 'yyyy-MM');
      acc[monthKey] = (acc[monthKey] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlySales)
      .map(([monthKey, sales]) => ({ 
        month: format(parseISO(monthKey), 'MMM yyyy', { locale: i18n.language === 'pt' ? ptBR : undefined }), 
        sales 
      }))
      .sort((a, b) => {
        // We need to parse the original monthKey to sort correctly
        const monthA = Object.keys(monthlySales).find(key => format(parseISO(key), 'MMM yyyy', { locale: i18n.language === 'pt' ? ptBR : undefined }) === a.month);
        const monthB = Object.keys(monthlySales).find(key => format(parseISO(key), 'MMM yyyy', { locale: i18n.language === 'pt' ? ptBR : undefined }) === b.month);
        return parseISO(monthA!).getTime() - parseISO(monthB!).getTime()
      });

  }, [data, i18n.language]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('sales_progression')}</CardTitle>
        <CardDescription>{t('sales_progression_description')}</CardDescription>
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
              {t('no_data_for_filters')}
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SalesOverTimeChart;
