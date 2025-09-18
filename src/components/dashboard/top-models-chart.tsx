'use client';

import type { FC, SVGProps } from 'react';
import { useMemo, useState } from 'react';
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
import type { TopModel, TopEntity } from '@/types';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Factory } from 'lucide-react';
import { Badge } from '../ui/badge';


const CustomLabel = (props: any) => {
    const { x, y, width, height, payload } = props;
    
    if (!payload || width < 50) {
        return null;
    }

    const labelX = 10;
    const labelY = y + height / 2 + 5;

    return (
        <g>
            <text x={labelX} y={labelY} fill="#fff" textAnchor="start" fontSize={12} fontWeight="bold">
                {payload.model}
            </text>
        </g>
    );
};


const TopModelsChart: FC<{ data: TopModel[], topManufacturer: TopEntity | null }> = ({ data, topManufacturer }) => {
  const { t } = useTranslation();
  const [showCount, setShowCount] = useState<5 | 10>(5);
  
  const chartConfig = {
    quantity: {
      label: t('quantity'),
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig;

  const chartData = useMemo(() => {
    return data.slice(0, showCount).sort((a,b) => a.quantity - b.quantity);
  }, [data, showCount]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>{t('top_models_by_volume', { count: showCount })}</CardTitle>
              <CardDescription>{t('top_models_by_volume_description_short')}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    variant={showCount === 5 ? 'default' : 'outline'}
                    onClick={() => setShowCount(5)}
                >
                    Top 5
                </Button>
                <Button
                    size="sm"
                    variant={showCount === 10 ? 'default' : 'outline'}
                    onClick={() => setShowCount(10)}
                >
                    Top 10
                </Button>
            </div>
        </div>
         {topManufacturer && topManufacturer.name !== '-' && (
            <div className='flex items-center gap-2 pt-4'>
                <Factory className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-sm font-medium">{t('main_manufacturer')}</h3>
                <Badge variant="secondary" className='text-sm'>{topManufacturer.name}</Badge>
            </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <ChartContainer config={chartConfig} className="w-full h-full min-h-[350px]">
            {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    accessibilityLayer
                    data={chartData}
                    layout="vertical"
                    margin={{
                        left: -4,
                        right: 10,
                        top: 10,
                        bottom: 10,
                    }}
                    barCategoryGap="20%"
                >
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="model" 
                        type="category"
                        tickLine={false}
                        axisLine={false}
                        tick={false}
                    />
                    <Tooltip
                        cursor={{ fill: 'hsl(var(--muted))' }}
                        content={
                            <ChartTooltipContent 
                                formatter={(value, name, props) => (
                                    <div className="flex flex-col gap-1">
                                      <div className='font-bold'>{props.payload.model}</div>
                                      <div>{t('quantity')}: {Number(value).toLocaleString()}</div>
                                    </div>
                                )}
                            />
                        }
                    />
                    <Bar dataKey="quantity" fill="hsl(var(--chart-1))" radius={4}>
                        <LabelList dataKey="model" content={<CustomLabel />} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                {t('no_data_available')}
            </div>
            )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TopModelsChart;
