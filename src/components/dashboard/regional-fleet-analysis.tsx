
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
import { regionToStatesMap } from '@/lib/regions';
import { Map } from 'lucide-react';

interface RegionalFleetAnalysisProps {
  data: RegionData[];
  total: number;
  selectedRegion?: string;
}

const RegionalFleetAnalysis: FC<RegionalFleetAnalysisProps> = ({ data, total, selectedRegion }) => {
  const { t } = useTranslation();

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    data.forEach((item, index) => {
        config[item.name] = {
            label: selectedRegion ? item.name : t(item.name as any),
            color: `hsl(var(--chart-${index + 1}))`,
        };
    });
    return config;
  }, [data, selectedRegion, t]);


  const chartData = useMemo(() => {
    let sourceData = data;
    if (selectedRegion && regionToStatesMap[selectedRegion]) {
        const statesInRegion = new Set(regionToStatesMap[selectedRegion]);
        sourceData = data.filter(item => statesInRegion.has(item.name));
    }
    
    if (!sourceData || sourceData.length === 0 || total === 0) return [];
    
    return sourceData
      .map(item => ({
        name: selectedRegion ? item.name : t(item.name as any),
        quantity: item.quantity,
        percentage: ((item.quantity / total) * 100).toFixed(1) + '%',
      }))
      .filter(item => item.quantity > 0)
      .sort((a,b) => b.quantity - a.quantity);
  }, [data, total, selectedRegion, t]);

  const title = selectedRegion ? t('state_fleet_analysis') : t('regional_fleet_analysis');
  const description = selectedRegion ? t('state_fleet_analysis_description') : t('regional_fleet_analysis_description');


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
            className="mx-auto aspect-square h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel 
                        formatter={(value, name, props) => (
                            <div className="flex flex-col gap-1">
                              <div className='font-bold'>{props.payload.name}</div>
                              <div>{t('quantity')}: {Number(value).toLocaleString()}</div>
                              <div>({props.payload.percentage})</div>
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
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={chartConfig[data[index].name]?.color}
                        className="focus:outline-none"
                      />
                    ))}
                  </Pie>
                  <Legend
                    content={({ payload }) => {
                      return (
                        <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted-foreground">
                          {payload?.map((entry, index) => (
                            <li key={`item-${index}`} className="flex items-center gap-2 truncate">
                              <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span>{entry.value}</span>
                            </li>
                          ))}
                        </ul>
                      )
                    }}
                    wrapperStyle={{
                        paddingLeft: '60px',
                        paddingRight: '60px',
                    }}
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
