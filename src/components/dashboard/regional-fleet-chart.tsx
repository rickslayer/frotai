
'use client';

import * as React from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell } from 'recharts';
import type { Vehicle } from '@/types';
import { allRegions, regionColors, stateToRegionMap } from '@/lib/regions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface RegionalFleetChartProps {
  data: Vehicle[];
}

const RegionalFleetChart: React.FC<RegionalFleetChartProps> = ({ data }) => {
  const { t } = useTranslation();

  const chartData = React.useMemo(() => {
    const regionalTotals: Record<string, number> = {
      'Norte': 0, 'Nordeste': 0, 'Centro-Oeste': 0, 'Sudeste': 0, 'Sul': 0,
    };

    data.forEach(vehicle => {
      const region = stateToRegionMap[vehicle.state.toUpperCase()];
      if (region && regionalTotals.hasOwnProperty(region)) {
        regionalTotals[region] += vehicle.quantity;
      }
    });

    return allRegions.map(region => ({
      name: region,
      quantity: regionalTotals[region],
      fill: regionColors[region] || 'hsl(var(--muted))'
    }));
  }, [data]);
  
  const totalVehicles = React.useMemo(() => chartData.reduce((acc, curr) => acc + curr.quantity, 0), [chartData]);

  const chartConfig = React.useMemo(() => {
    const config: any = {};
    chartData.forEach(item => {
        config[item.name] = {
            label: t(item.name as any),
            color: item.fill,
        };
    });
    return config;
  }, [chartData, t]);
  

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{t('regional_fleet_analysis')}</CardTitle>
        <CardDescription>{t('regional_fleet_analysis_description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center p-2 sm:p-4">
        {totalVehicles > 0 ? (
          <div className="w-full h-[250px] flex flex-col md:flex-row items-center gap-4">
             <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square h-full w-full md:w-1/2"
              >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel nameKey="name" />}
                    />
                  <Pie
                    data={chartData}
                    dataKey="quantity"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={2}
                    labelLine={false}
                  >
                    {chartData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.quantity > 0 ? entry.fill : 'hsl(var(--muted))'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="w-full md:w-1/2 flex flex-col gap-2 text-sm">
               <div className="font-semibold mb-2">{t('total_by_region')}</div>
              {chartData.map((entry) => (
                <div key={entry.name} className={cn("flex items-center justify-between transition-opacity", entry.quantity === 0 && "opacity-50")}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.quantity > 0 ? entry.fill : 'hsl(var(--muted))' }}
                    />
                    <span>{t(entry.name as any)}</span>
                  </div>
                   <div className='flex items-center gap-3'>
                    <span className="font-mono text-xs text-muted-foreground">
                        {entry.quantity.toLocaleString()}
                    </span>
                    <Badge variant="secondary" className='w-16 justify-center font-mono'>
                        {totalVehicles > 0 ? ((entry.quantity / totalVehicles) * 100).toFixed(1) : '0.0'}%
                    </Badge>
                   </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-center">
            {t('no_data_for_regional_chart')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RegionalFleetChart;
