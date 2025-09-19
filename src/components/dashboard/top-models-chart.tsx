'use client';

import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';
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

const CustomLabel = (props: any) => {
    const { x, y, width, height, value, name } = props;

    // Safety check: if there's no payload or the bar is too small, render nothing.
    if (!name || width < 150) { // Safety margin for visibility
        return null;
    }

    const valueText = Number(value).toLocaleString();
    const valuePadding = 8;
    const textPadding = 10;
    
    // Estimate width of the value box
    const valueBoxWidth = valueText.length * 7 + (valuePadding * 2); // Approximation

    return (
        <g transform={`translate(${x},${y})`}>
            {/* Model Name */}
            <text 
                x={textPadding} 
                y={height / 2} 
                fill="hsl(var(--primary-foreground))"
                textAnchor="start" 
                dominantBaseline="middle" 
                fontSize={12} 
                fontWeight="bold"
            >
                {name}
            </text>
            
            {/* Value Box */}
            <rect 
                x={width - valueBoxWidth - 5} 
                y={5}
                width={valueBoxWidth}
                height={height - 10}
                fill="hsl(var(--primary))"
                rx={4} // Rounded corners
            />
            
            {/* Value Text */}
            <text 
                x={width - (valueBoxWidth / 2) - 5}
                y={height / 2} 
                fill="hsl(var(--primary-foreground))"
                textAnchor="middle" 
                dominantBaseline="middle" 
                fontSize={12} 
                fontWeight="bold"
            >
                {valueText}
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
    // Sort descending to have the largest bar at the top
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
                    data={chartData}
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
                    <Bar dataKey="quantity" fill="var(--color-quantity)" radius={[4, 4, 4, 4]}>
                       <LabelList 
                          dataKey="model" 
                          content={(props: any) => <CustomLabel {...props} name={props.value} value={props.payload.quantity} />}
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
