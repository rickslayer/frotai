'use client';

import type { FC } from 'react';
import { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { TopModel } from '@/types';
import { useTranslation } from 'react-i18next';

interface TopModelsChartProps {
  data: TopModel[];
}

const TopModelsChart: FC<TopModelsChartProps> = ({ data }) => {
  const { t } = useTranslation();
  const [count, setCount] = useState<5 | 10>(5);

  const chartData = useMemo(() => {
    return data
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, count);
  }, [data, count]);

  const maxQuantity = useMemo(() => {
    return chartData.length > 0 ? chartData[0].quantity : 0;
  }, [chartData]);


  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{t('top_models_by_volume', { count })}</CardTitle>
                <CardDescription>{t('top_models_by_volume_description_short')}</CardDescription>
            </div>
            <ToggleGroup 
                type="single" 
                defaultValue="5" 
                variant="outline" 
                size="sm"
                onValueChange={(value) => setCount(value === '10' ? 10 : 5)}
                aria-label={`Toggle between Top 5 and Top 10 models`}
            >
                <ToggleGroupItem value="5" aria-label="Top 5">
                    {t('top_5')}
                </ToggleGroupItem>
                <ToggleGroupItem value="10" aria-label="Top 10">
                    {t('top_10')}
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {chartData.length > 0 ? (
          <div className="space-y-6">
            {chartData.map((item) => (
              <div key={item.model}>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium text-foreground truncate pr-4">{item.model}</p>
                  <p className="text-sm font-semibold text-foreground">{item.quantity.toLocaleString()}</p>
                </div>
                <Progress
                  value={maxQuantity > 0 ? (item.quantity / maxQuantity) * 100 : 0}
                  indicatorClassName="bg-chart-2"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            {t('no_data_available')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopModelsChart;
