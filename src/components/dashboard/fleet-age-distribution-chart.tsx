
'use client';

import type { FC } from 'react';
import { useMemo } from 'react';
import { Pie, PieChart, Cell, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

interface FleetAgeDistributionChartProps {
  data: Vehicle[];
}

const currentYear = new Date().getFullYear();
const AGE_GROUPS = {
  '0-3': { label: '0-3 anos', min: 0, max: 3, color: 'hsl(var(--chart-1))' },
  '4-7': { label: '4-7 anos', min: 4, max: 7, color: 'hsl(var(--chart-2))' },
  '8-12': { label: '8-12 anos', min: 8, max: 12, color: 'hsl(var(--chart-3))' },
  '13+': { label: '13+ anos', min: 13, max: Infinity, color: 'hsl(var(--chart-4))' },
};

const FleetAgeDistributionChart: FC<FleetAgeDistributionChartProps> = ({ data }) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    const ageDistribution = Object.keys(AGE_GROUPS).reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {} as Record<string, number>);

    data.forEach(item => {
      const age = currentYear - item.year;
      for (const key in AGE_GROUPS) {
        const group = AGE_GROUPS[key as keyof typeof AGE_GROUPS];
        if (age >= group.min && age <= group.max) {
          ageDistribution[key] += item.quantity;
          break;
        }
      }
    });
    
    return Object.entries(ageDistribution)
      .map(([key, value]) => ({
        ageGroup: AGE_GROUPS[key as keyof typeof AGE_GROUPS].label,
        quantity: value,
        fill: AGE_GROUPS[key as keyof typeof AGE_GROUPS].color,
      }))
      .filter(item => item.quantity > 0)
      .sort((a,b) => a.quantity - b.quantity);

  }, [data]);

  const chartConfig = Object.entries(AGE_GROUPS).reduce((acc, [key, value]) => {
      acc[value.label] = {
          label: value.label,
          color: value.color
      }
      return acc;
  }, {} as ChartConfig);


  return (
    <Card className="xl:col-span-1 flex flex-col">
      <CardHeader>
        <CardTitle>{t('fleet_age_distribution')}</CardTitle>
        <CardDescription>{t('fleet_age_distribution_description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-full max-h-[250px]">
           {chartData.length > 0 ? (
            <PieChart>
              <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent nameKey="ageGroup" hideLabel />} />
              <Pie
                data={chartData}
                dataKey="quantity"
                nameKey="ageGroup"
                innerRadius={60}
                strokeWidth={5}
                >
                    {chartData.map((entry) => (
                        <Cell key={`cell-${entry.ageGroup}`} fill={entry.fill} />
                    ))}
                </Pie>
            </PieChart>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              {t('no_data_available')}
            </div>
          )}
        </ChartContainer>
      </CardContent>
       <CardFooter className="flex-col gap-2 text-sm mt-4">
        <div className="flex w-full items-center justify-center gap-2 font-medium leading-none">
          {chartData.map((item) => (
             <div key={item.ageGroup} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: item.fill}} />
                <span>{item.ageGroup}</span>
             </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
};

export default FleetAgeDistributionChart;
