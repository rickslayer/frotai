
'use client';

import type { FC } from 'react';
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

interface TopModelsChartProps {
  data: TopModel[];
  topManufacturer: TopEntity | null;
}

const CustomLabel: FC<any> = ({ x, y, width, value }) => {
  if (width < 40) return null; // Don't render label if the bar is too short
  return (
    <text x={x + width - 10} y={y + 16} fill="#fff" textAnchor="end" className="text-xs font-medium">
      {value.toLocaleString()}
    </text>
  );
};


const TopModelsChart: FC<TopModelsChartProps> = ({ data, topManufacturer }) => {
  const { t } = useTranslation();
  const [topN, setTopN] = useState<5 | 10>(10);

  const chartConfig = {
    quantity: {
      label: t('quantity'),
      color: 'hsl(var(--accent))',
    },
  } satisfies ChartConfig;

  const chartData = useMemo(() => {
    return data.slice(0, topN);
  }, [data, topN]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('top_models_by_volume', { count: topN })}</CardTitle>
              <CardDescription>{t('top_models_by_volume_description')}</CardDescription>
            </div>
            <div className='flex gap-2'>
                <Button variant={topN === 5 ? 'default' : 'outline'} size="sm" onClick={() => setTopN(5)}>{t('top_5')}</Button>
                <Button variant={topN === 10 ? 'default' : 'outline'} size="sm" onClick={() => setTopN(10)}>{t('top_10')}</Button>
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
        <ChartContainer config={chartConfig} className="w-full h-full min-h-[400px]">
            {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    accessibilityLayer
                    data={chartData}
                    layout="vertical"
                    margin={{
                        left: 120,
                        right: 30,
                        top: 10,
                        bottom: 10,
                    }}
                >
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="model" 
                        type="category" 
                        tickLine={false} 
                        axisLine={false}
                        stroke="#888888" 
                        fontSize={12}
                        interval={0}
                        width={120}
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
                    <Bar dataKey="quantity" fill="var(--color-quantity)" radius={[0, 4, 4, 0]}>
                        <LabelList
                            dataKey="quantity"
                            content={<CustomLabel />}
                        />
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
