
'use client';

import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  type ChartConfig,
} from '@/components/ui/chart';
import type { TopModel, TopEntity } from '@/types';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Factory } from 'lucide-react';
import { Badge } from '../ui/badge';

// A simple, robust custom label component.
const CustomizedLabel: FC<any> = (props) => {
    const { x, y, width, height, payload } = props;

    if (!payload) {
        return null;
    }
    
    const { model, quantity } = payload;
    const padding = 10;
    
    // Don't render label if the bar is too small
    if (width < 80) {
        return null;
    }

    return (
        <g>
            <text 
                x={x + padding} 
                y={y + height / 2} 
                dy=".35em"
                fill="hsl(var(--primary-foreground))"
                fontWeight="bold"
                fontSize="12" 
                textAnchor="start"
            >
                {model}
            </text>
            <text
                x={x + width - padding}
                y={y + height / 2}
                dy=".35em"
                fill="hsl(var(--primary-foreground))"
                fontWeight="bold"
                fontSize="12" 
                textAnchor="end"
            >
                {quantity.toLocaleString()}
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
      color: 'hsl(var(--chart-2))',
    },
  } satisfies ChartConfig;

  const chartData = useMemo(() => {
    // Sort descending for correct order
    return data.slice(0, showCount).sort((a,b) => b.quantity - a.quantity);
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
                    data={chartData.slice().reverse()} // Reverse for top-to-bottom rendering
                    layout="vertical"
                    margin={{ left: 0, right: 0, top: 10, bottom: 10 }}
                    barCategoryGap="25%"
                >
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="model" 
                        type="category"
                        tickLine={false}
                        axisLine={false}
                        hide
                    />
                    <Bar 
                      dataKey="quantity" 
                      fill="var(--color-quantity)" 
                      radius={[4, 4, 4, 4]}
                      label={<CustomizedLabel />}
                    />
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
