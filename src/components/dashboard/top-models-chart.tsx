
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
import { Factory } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';

interface TopModelsChartProps {
  data: TopModel[];
  topManufacturer: TopEntity | null;
}

const TopModelsChart: FC<TopModelsChartProps> = ({ data, topManufacturer }) => {
  const { t } = useTranslation();
  const [topN, setTopN] = useState<string>('5');

  const chartConfig = {
    quantity: {
      label: t('quantity'),
      color: 'hsl(var(--accent))',
    },
  } satisfies ChartConfig;

  const chartData = useMemo(() => {
    return data.slice(0, Number(topN));
  }, [data, topN]);

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
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full max-h-[400px] w-full overflow-y-auto pr-4">
            <ChartContainer config={chartConfig} className="h-full min-h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={chartData.length * 45}>
                  <BarChart
                    accessibilityLayer
                    data={chartData}
                    layout="vertical"
                    margin={{
                      left: 10,
                      right: 40,
                      top: 0,
                      bottom: 0,
                    }}
                  >
                    <YAxis dataKey="model" type="category" width={0} tick={false} />
                    <XAxis dataKey="quantity" type="number" hide />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      content={<ChartTooltipContent />}
                    />
                    <Bar dataKey="quantity" layout="vertical" radius={5} barSize={35} fill="var(--color-quantity)">
                      <LabelList
                        dataKey="model"
                        position="insideLeft"
                        offset={8}
                        className="fill-primary-foreground text-sm font-medium truncate"
                        formatter={(value: string) => value}
                      />
                       <LabelList 
                          dataKey="quantity" 
                          position="right"
                          offset={8}
                          className="fill-foreground font-semibold"
                          formatter={(value: number) => value.toLocaleString()}
                        />
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
