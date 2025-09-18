
'use client';

import type { FC } from 'react';
import { useMemo } from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip, Legend } from 'recharts';
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
import type { FleetAgeBracket } from '@/types';
import { useTranslation } from 'react-i18next';
import { Car, History, Sparkles, Wrench } from 'lucide-react';

interface FleetAgeBracketChartProps {
  data: FleetAgeBracket[];
  totalVehicles: number;
}

const FleetAgeBracketChart: FC<FleetAgeBracketChartProps> = ({ data, totalVehicles }) => {
  const { t } = useTranslation();

  const chartConfig = useMemo(() => ({
    'Novos (0-3 anos)': { label: t('age_bracket_new'), color: 'hsl(var(--chart-1))', icon: Sparkles },
    'Seminovos (4-7 anos)': { label: t('age_bracket_semi_new'), color: 'hsl(var(--chart-2))', icon: Car },
    'Usados (8-12 anos)': { label: t('age_bracket_used'), color: 'hsl(var(--chart-3))', icon: Wrench },
    'Antigos (13+ anos)': { label: t('age_bracket_old'), color: 'hsl(var(--chart-4))', icon: History },
  }) as ChartConfig, [t]);

  const chartData = useMemo(() => {
    return data
      .map(item => ({
        ...item,
        name: item.label,
        fill: chartConfig[item.label]?.color,
        percentage: totalVehicles > 0 ? ((item.quantity / totalVehicles) * 100) : 0,
      }))
      .filter(item => item.quantity > 0)
      .sort((a, b) => b.quantity - a.quantity);
  }, [data, totalVehicles, chartConfig]);


  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{t('fleet_by_age_bracket')}</CardTitle>
        <CardDescription>{t('fleet_by_age_bracket_description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
         {chartData.length > 0 ? (
            <ChartContainer
                config={chartConfig}
                className="mx-auto w-full aspect-square max-h-[350px]"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Tooltip
                        cursor={false}
                        content={
                        <ChartTooltipContent
                            hideLabel
                            formatter={(value, name, props) => (
                            <div className="flex flex-col gap-1 text-sm">
                                <div className="font-bold">{props.payload.name}</div>
                                <div>
                                {t('quantity')}: {Number(value).toLocaleString()}
                                </div>
                                <div>({props.payload.percentage.toFixed(1)}%)</div>
                            </div>
                            )}
                        />
                        }
                    />
                    <Pie
                        data={chartData}
                        dataKey="quantity"
                        nameKey="name"
                        innerRadius={60}
                        strokeWidth={5}
                        outerRadius={80}
                    >
                        {chartData.map((entry) => (
                        <Cell
                            key={entry.name}
                            fill={entry.fill}
                            className="focus:outline-none"
                        />
                        ))}
                    </Pie>
                    <Legend
                        content={({ payload }) => {
                        return (
                            <ul className="flex flex-col gap-3 max-w-[200px] text-xs">
                            {payload?.map((entry) => {
                                const item = chartData.find(d => d.name === entry.value);
                                if (!item) return null;
                                
                                const Icon = chartConfig[item.name]?.icon;

                                return (
                                <li
                                    key={item.name}
                                    className="flex items-start gap-2 truncate"
                                >
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span
                                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                                            style={{ backgroundColor: entry.color }}
                                        />
                                        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-foreground truncate">{entry.value}</span>
                                        <span className="text-muted-foreground">
                                           {item.quantity.toLocaleString()} ({item.percentage.toFixed(1)}%)
                                        </span>
                                    </div>
                                </li>
                                )
                            })}
                            </ul>
                        )
                        }}
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        wrapperStyle={{ paddingLeft: '20px' }}
                    />
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>
         ) : (
             <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              {t('no_data_available')}
            </div>
         )}
      </CardContent>
    </Card>
  );
};

export default FleetAgeBracketChart;
