
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
import { ScrollArea } from '../ui/scroll-area';

interface CustomLabelProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: string | number;
  dataKey?: string;
  index?: number;
  payload?: any;
}

const CustomLabel: FC<CustomLabelProps> = (props) => {
  const { x, y, width, height, payload } = props;

  // Type guards to ensure all properties are numbers
  if (typeof x !== 'number' || typeof y !== 'number' || typeof width !== 'number' || typeof height !== 'number' || !payload) {
    return null;
  }

  const modelName = payload.model;
  const quantity = payload.quantity;
  const quantityText = quantity.toLocaleString();
  const textPadding = 5;
  
  const quantityTextWidth = quantityText.length * 6;

  // Don't render if bar is too short
  if (width < quantityTextWidth + 20) {
    return null;
  }

  return (
    <g>
      <text x={x + textPadding} y={y + height / 2} dy={4} fill="#fff" textAnchor="start" className="text-xs font-medium truncate">
        {modelName}
      </text>
      <text x={x + width + textPadding} y={y + height / 2} dy={4} fill="hsl(var(--foreground))" textAnchor="start" className="text-xs font-medium">
        {quantityText}
      </text>
    </g>
  );
};


const TopModelsChart: FC<TopModelsChartProps> = ({ data, topManufacturer }) => {
  const { t } = useTranslation();

  const chartConfig = {
    quantity: {
      label: t('quantity'),
      color: 'hsl(var(--accent))',
    },
  } satisfies ChartConfig;

  const chartData = useMemo(() => {
    return data;
  }, [data]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('top_models_by_volume', { count: 10 })}</CardTitle>
              <CardDescription>{t('top_models_by_volume_description_short')}</CardDescription>
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
         <ScrollArea className="h-[400px] w-full">
            <ChartContainer config={chartConfig} className="w-full h-full min-h-[400px]">
                {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={chartData.length * 40}>
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        layout="vertical"
                        margin={{
                            left: 10,
                            right: 60, // Space for the quantity label
                            top: 10,
                            bottom: 10,
                        }}
                    >
                        <XAxis type="number" hide />
                        <YAxis 
                            dataKey="model" 
                            type="category" 
                            hide={true}
                            interval={0}
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
                        <Bar dataKey="quantity" fill="var(--color-quantity)" radius={[4, 4, 4, 4]} barSize={20}>
                           <LabelList 
                                dataKey="model"
                                content={<CustomLabel />}
                                position="insideLeft" 
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
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TopModelsChart;
