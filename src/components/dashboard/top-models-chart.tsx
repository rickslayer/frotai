
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
import { cn } from '@/lib/utils';


interface CustomLabelProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: string | number;
  payload?: any;
}

const CustomLabel: FC<CustomLabelProps> = (props) => {
  const { x, y, width, height, payload } = props;

  if (typeof x !== 'number' || typeof y !== 'number' || typeof width !== 'number' || typeof height !== 'number' || !payload) {
    return null;
  }

  const modelName = payload.model;
  const quantity = payload.quantity.toLocaleString();
  const textPadding = 8;
  const modelTextWidth = modelName.length * 6; // Approximate width

  const canShowModelName = width > modelTextWidth + textPadding;

  return (
    <g>
      {canShowModelName && (
        <text
          x={x + textPadding}
          y={y + height / 2}
          dy={4}
          fill="#ffffff"
          textAnchor="start"
          className="text-xs font-medium truncate"
        >
          {modelName}
        </text>
      )}
      
       <text
        x={x + width + textPadding}
        y={y + height / 2}
        dy={4}
        fill="hsl(var(--foreground))"
        textAnchor="start"
        className="text-xs font-medium"
      >
        {quantity}
      </text>
    </g>
  );
};


interface TopModelsChartProps {
  data: TopModel[];
  topManufacturer: TopEntity | null;
}

const TopModelsChart: FC<TopModelsChartProps> = ({ data, topManufacturer }) => {
  const { t } = useTranslation();
  const [topN, setTopN] = useState(10);

  const chartConfig = {
    quantity: {
      label: t('quantity'),
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig;

  const chartData = useMemo(() => {
    return data.slice(0, topN).sort((a,b) => a.quantity - b.quantity);
  }, [data, topN]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>{t('top_models_by_volume', { count: topN })}</CardTitle>
              <CardDescription>{t('top_models_by_volume_description_short')}</CardDescription>
            </div>
             <div className="flex items-center gap-2">
                <Button size="sm" variant={topN === 5 ? 'default' : 'outline'} onClick={() => setTopN(5)}>Top 5</Button>
                <Button size="sm" variant={topN === 10 ? 'default' : 'outline'} onClick={() => setTopN(10)}>Top 10</Button>
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
                        left: 10,
                        right: 50,
                        top: 10,
                        bottom: 10,
                    }}
                    barCategoryGap="20%"
                >
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="model" 
                        type="category" 
                        hide={true}
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
                    <Bar dataKey="quantity" fill="hsl(var(--chart-1))" radius={[4, 4, 4, 4]}>
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
      </CardContent>
    </Card>
  );
};

export default TopModelsChart;
