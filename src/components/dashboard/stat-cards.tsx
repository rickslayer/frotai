'use client';

import type { FC } from 'react';
import { useMemo } from 'react';
import type { Sale } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Car, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StatCardsProps {
  data: Sale[];
}

const StatCards: FC<StatCardsProps> = ({ data }) => {
  const { t } = useTranslation();

  const { totalSales, topModel, topRegion } = useMemo(() => {
    if (!data.length) {
      return { totalSales: 0, topModel: 'N/A', topRegion: 'N/A' };
    }

    const totalSales = data.reduce((sum, item) => sum + item.quantity, 0);

    const modelSales = data.reduce((acc, item) => {
      const key = `${item.manufacturer} ${item.model}`;
      acc[key] = (acc[key] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);

    let topModel = 'N/A';
    let maxModelSales = 0;
    for (const model in modelSales) {
      if (modelSales[model] > maxModelSales) {
        maxModelSales = modelSales[model];
        topModel = model;
      }
    }
    
    const regionSales = data.reduce((acc, item) => {
      const key = item.city ? `${item.city}, ${item.state}` : item.state;
      acc[key] = (acc[key] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);

    let topRegion = 'N/A';
    let maxRegionSales = 0;
    for (const region in regionSales) {
        if(regionSales[region] > maxRegionSales) {
            maxRegionSales = regionSales[region];
            topRegion = region;
        }
    }

    return { totalSales, topModel, topRegion };
  }, [data]);

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('total_sales')}</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSales.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{t('total_sales_description')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('best_selling_model')}</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{topModel}</div>
          <p className="text-xs text-muted-foreground">{t('best_selling_model_description')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('top_sales_region')}</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{topRegion}</div>
          <p className="text-xs text-muted-foreground">{t('top_sales_region_description')}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatCards;
