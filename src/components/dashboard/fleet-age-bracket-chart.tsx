'use client';

import type { FC } from 'react';
import { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
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

interface FleetAgeBracketChartProps {
  data: Vehicle[];
}

const FleetAgeBracketChart: FC<FleetAgeBracketChartProps> = ({ data }) => {
  const { t } = useTranslation();

  const chartConfig = {
    quantity: {
      label: t('quantity'),
      color: 'hsl(var(--chart-2))',
    },
    new: { label: t('age_bracket_new'), color: 'hsl(var(--chart-1))' },
    semiNew: { label: t('age_bracket_semi_new'), color: 'hsl(var(--chart-2))' },
    used: { label: t('age_bracket_used'), color: 'hsl(var(--chart-3))' },
    old: { label: t('age_bracket_old'), color: 'hsl(var(--chart-4))' },
  } satisfies ChartConfig;

  const chartData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const ageBrackets = {
      new: { total: 0, label: chartConfig.new.label },
      semiNew: { total: 0, label: chartConfig.semiNew.label },
      used: { total: 0, label: chartConfig.used.label },
      old: { total: 0, label: chartConfig.old.label },
    };

    data.forEach(item => {
      const age = currentYear - item.year;
      if (age >= 0 && age <= 3) {
        ageBrackets.new.total += item.quantity;
      } else if (age >= 4 && age <= 7) {
        ageBrackets.semiNew.total += item.quantity;
      } else if (age >= 8 && age <= 12) {
        ageBrackets.used.total += item.quantity;
      } else if (age >= 13) {
        ageBrackets.old.total += item.quantity;
      }
    });

    return [
      { bracket: ageBrackets.new.label, quantity: ageBrackets.new.total, fill: 'var(--color-new)' },
      { bracket: ageBrackets.semiNew.label, quantity: ageBrackets.semiNew.total, fill: 'var(--color-semiNew)' },
      { bracket: ageBrackets.used.label, quantity: ageBrackets.used.total, fill: 'var(--color-used)' },
      { bracket: ageBrackets.old.label, quantity: ageBrackets.old.total, fill: 'var(--color-old)' },
    ].filter(d => d.quantity > 0);

  }, [data, t]);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{t('fleet_by_age_bracket')}</CardTitle>
        <CardDescription>{t('fleet_by_age_bracket_description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          {chartData.length > 0 ? (
             <ResponsiveContainer width="100%" height={250}>
              <BarChart
                accessibilityLayer
                data={chartData}
                margin={{
                  top: 20,
                  right: 20,
                  left: -10,
                  bottom: 5,
                }}
                layout="vertical"
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="bracket"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  width={110}
                  
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="quantity" radius={5} barSize={35} />
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

export default FleetAgeBracketChart;
