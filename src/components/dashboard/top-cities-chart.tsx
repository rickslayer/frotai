
'use client';

import type { FC } from 'react';
import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { MapPin } from 'lucide-react';

interface TopCitiesChartProps {
  data: { name: string, quantity: number }[];
  total: number;
}

const TopCitiesChart: FC<TopCitiesChartProps> = ({ data, total }) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    if (!data || data.length === 0 || total === 0) return [];
    
    return data.map(item => ({
      ...item,
      percentage: (item.quantity / total) * 100,
    })).sort((a,b) => b.quantity - a.quantity);
  }, [data, total]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{t('top_cities_chart_title')}</CardTitle>
        <CardDescription>{t('top_cities_chart_description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        {chartData.length > 0 ? (
          <div className="space-y-4">
            {chartData.map((city, index) => (
              <div key={city.name} className="grid grid-cols-[1fr_auto_auto] items-center gap-4">
                <div className='flex items-center gap-2'>
                  <MapPin className={cn("h-4 w-4", index === 0 ? "text-primary" : "text-muted-foreground")} />
                  <span className="font-medium truncate">{city.name}</span>
                </div>
                <div className="text-right">
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    {city.quantity.toLocaleString()}
                  </Badge>
                </div>
                <div className="w-24 text-right">
                   <Progress value={city.percentage} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-center">
            {t('no_data_for_cities_chart')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopCitiesChart;
