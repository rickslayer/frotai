
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
import { Car, Factory } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';

interface TopModelsChartProps {
  data: TopModel[];
  topManufacturer: TopEntity | null;
}

const CustomLabel: FC<any> = (props) => {
  const { x, y, width, height, value } = props;
  if (!value) return null;
  
  const formattedValue = Number(value).toLocaleString();
  const textWidth = formattedValue.length * 6; // Rough estimation

  if (width < textWidth + 10) return null; // Don't render if it doesn't fit

  return (
    <g>
      <text x={x + width - 5} y={y + height / 2} textAnchor="end" dominantBaseline="middle" fill="hsl(var(--card-foreground))" fontSize="12">
        {formattedValue}
      </text>
    </g>
  );
};


const TopModelsChart: FC<TopModelsChartProps> = ({ data, topManufacturer }) => {
  const { t } = useTranslation();
  const [topN, setTopN] = useState<string>('10');

  const chartConfig = {
    quantity: {
      label: t('quantity'),
      color: 'hsl(var(--accent))',
    },
  } satisfies ChartConfig;

  const chartData = useMemo(() => {
    return data.slice(0, Number(topN)).map(item => ({
      ...item
    })).sort((a,b) => a.quantity - b.quantity);
  }, [data, topN]);
  
  const chartHeight = Math.max(200, chartData.length * 40);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
           <div className='flex-1'>
            <CardTitle>{t('top_models_by_volume', { count: topN })}</CardTitle>
            <CardDescription>{t('top_models_by_volume_description_short')}</CardDescription>
           </div>
           <Select value={topN} onValueChange={setTopN}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Top..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Top 5</SelectItem>
                <SelectItem value="10">Top 10</SelectItem>
                <SelectItem value="20">Top 20</SelectItem>
                <SelectItem value="50">Top 50</SelectItem>
              </SelectContent>
            </Select>
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
          <ScrollArea className="w-full h-96" type="auto">
            <ChartContainer config={chartConfig} className="w-full" style={{ height: `${chartHeight}px` }}>
                {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        layout="vertical"
                        margin={{
                            left: 10,
                            right: 40,
                            top: 10,
                            bottom: 10,
                        }}
                    >
                        <XAxis type="number" hide />
                        <YAxis 
                            dataKey="model" 
                            type="category"
                            stroke="#888888" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            width={150}
                            tick={{
                                dy: 2,
                                textAnchor: 'start',
                                transform: 'translate(-150, 0)',
                             }}
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
                            <LabelList dataKey="quantity" content={<CustomLabel />} position="right" />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    {t('no_data_available')}
                </div>
                )}
            </ChartContainer>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TopModelsChart;

    