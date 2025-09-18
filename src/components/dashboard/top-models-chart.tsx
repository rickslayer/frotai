'use client';

import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { Bar, BarChart, XAxis, YAxis, LabelList, ResponsiveContainer } from 'recharts';
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
    const { x, y, width, height, value, payload } = props;
    const padding = 10;
    
    // Não renderiza nada se a barra for muito pequena
    if (width < 20 || !payload) {
        return null;
    }

    const modelName = payload.model;
    const quantity = value.toLocaleString();
    const labelY = y + height / 2;

    // Estimação simples para ver se ambos cabem com algum espaço
    const fullText = `${modelName}${quantity}`;
    const estimatedTextWidth = fullText.length * 6; // Ajuste este multiplicador conforme necessário

    if (width < estimatedTextWidth + (padding * 2)) {
      // Se não couber, mostra apenas a quantidade se houver espaço para ela
       if (width < quantity.length * 8 + padding) {
         return null;
       }
       return (
         <g>
           <text x={x + width - padding} y={labelY} fill="#fff" textAnchor="end" dominantBaseline="middle" fontSize={12} fontWeight="bold">
             {quantity}
           </text>
         </g>
       );
    }
    
    return (
        <g>
            <text x={x + padding} y={labelY} fill="#fff" textAnchor="start" dominantBaseline="middle" fontSize={12} fontWeight="bold">
                {modelName}
            </text>
            <text x={x + width - padding} y={labelY} fill="#fff" textAnchor="end" dominantBaseline="middle" fontSize={12} fontWeight="bold">
                {quantity}
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
                    margin={{ left: 0, right: 0, top: 10, bottom: 10 }}
                    barCategoryGap="25%"
                >
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="model" 
                        type="category"
                        tickLine={false}
                        axisLine={false}
                        tick={false}
                    />
                    <Bar dataKey="quantity" fill="hsl(var(--chart-1))" radius={4}>
                        <LabelList dataKey="quantity" content={<CustomLabel />} />
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
