
'use client';

import type { FC } from 'react';
import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { RegionData } from '@/types';
import { stateToRegionMap } from '@/lib/regions';
import { Map } from 'lucide-react';

interface RegionalFleetAnalysisProps {
  data: RegionData[];
  selectedRegion?: string;
  selectedState?: string;
}

const RegionalFleetAnalysis: FC<RegionalFleetAnalysisProps> = ({ data, selectedRegion, selectedState }) => {
  const { t } = useTranslation();

  const isStateView = !!(selectedRegion || (selectedState && stateToRegionMap[selectedState]));
  const total = useMemo(() => data.reduce((acc, curr) => acc + curr.quantity, 0), [data]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    data.forEach((item, index) => {
        config[item.name] = {
            label: isStateView ? item.name : t(item.name as any),
            color: `hsl(var(--chart-${index + 1}))`,
        };
    });
    return config;
  }, [data, isStateView, t]);


  const chartData = useMemo(() => {
    if (!data || data.length === 0 || total === 0) return [];
    
    return data
      .map(item => ({
        name: isStateView ? item.name : t(item.name as any),
        quantity: item.quantity,
        percentage: total > 0 ? ((item.quantity / total) * 100) : 0,
      }))
      .filter(item => item.quantity > 0)
      .sort((a,b) => b.quantity - a.quantity);
  }, [data, total, isStateView, t]);

  const title = isStateView ? t('state_fleet_analysis') : t('regional_fleet_analysis');
  const description = isStateView ? t('state_fleet_analysis_description') : t('regional_fleet_analysis_description');


  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
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
                    content={<ChartTooltipContent hideLabel 
                        formatter={(value, name, props) => (
                            <div className="flex flex-col gap-1 text-sm">
                              <div className='font-bold'>{props.payload.name}</div>
                              <div>{t('quantity')}: {Number(value).toLocaleString()}</div>
                              <div>({props.payload.percentage.toFixed(1)}%)</div>
                            </div>
                        )}
                    />}
                  />
                  <Pie
                    data={chartData}
                    dataKey="quantity"
                    nameKey="name"
                    innerRadius={60}
                    strokeWidth={5}
                    cy="50%"
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={chartConfig[entry.name]?.color}
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
                              
                              return (
                                <li key={item.name} className="flex items-start gap-2 truncate">
                                  <span className="flex items-center gap-2 mt-0.5">
                                    <span
                                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                                      style={{ backgroundColor: entry.color }}
                                    />
                                  </span>
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
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-center p-8">
            <div className='flex flex-col items-center gap-2'>
                <Map className='h-10 w-10 text-primary/30' />
                <p>{t('no_data_for_regional_chart')}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RegionalFleetAnalysis;
