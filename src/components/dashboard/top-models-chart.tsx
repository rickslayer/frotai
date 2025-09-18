
'use client';

import type { FC, SVGProps } from 'react';
import { useMemo, useState } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer, CartesianGrid } from 'recharts';
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
  const { x, y, width, value } = props;
  if (!value) return null;

  return (
    <g>
      <Car 
        x={x + width / 2 - 8} // Center the icon
        y={y - 20} // Position above the bar
        width={16} 
        height={16} 
        className="text-muted-foreground"
      />
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
      ...item,
      // Truncate long model names for better display on X-axis
      shortModel: item.model.length > 15 ? `${item.model.substring(0, 15)}...` : item.model,
    }));
  }, [data, topN]);
  
  // Calculate width based on number of items
  const chartWidth = Math.max(800, chartData.length * 80);

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
          <ScrollArea className="w-full h-[400px]" type="auto">
            <ChartContainer config={chartConfig} className="w-full" style={{ height: '380px', width: `${chartWidth}px` }}>
                {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 10,
                            right: 10,
                            top: 30, // Make space for icons
                            bottom: 20,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis 
                            dataKey="shortModel" 
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            angle={-45}
                            textAnchor="end"
                            height={60} // increase height to fit rotated labels
                            interval={0} // show all labels
                        />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
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
                        <Bar dataKey="quantity" fill="var(--color-quantity)" radius={[4, 4, 0, 0]}>
                            <LabelList dataKey="quantity" content={<CustomLabel />} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                ) : (
                <div className="flex h-[300px] w-full items-center justify-center text-muted-foreground">
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
