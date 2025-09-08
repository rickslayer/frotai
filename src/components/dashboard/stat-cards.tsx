'use client';

import type { FC } from 'react';
import { useMemo } from 'react';
import type { Filters, Vehicle } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, MapPin, Users2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StatCardsProps {
  data: Vehicle[];
  filters: Filters;
}

const StatCards: FC<StatCardsProps> = ({ data, filters }) => {
  const { t } = useTranslation();

  const { totalVehicles, topModel, topRegion } = useMemo(() => {
    if (!data.length) {
      return { totalVehicles: 0, topModel: t('no_data_available'), topRegion: t('no_data_available') };
    }

    const totalVehicles = data.reduce((sum, item) => sum + item.quantity, 0);

    const modelSales = data.reduce((acc, item) => {
      const key = `${item.manufacturer} ${item.model}`;
      acc[key] = (acc[key] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);

    let topModel = t('no_data_available');
    let maxModelSales = 0;
    for (const model in modelSales) {
      if (modelSales[model] > maxModelSales) {
        maxModelSales = modelSales[model];
        topModel = model;
      }
    }
    
    let topRegionDisplay = t('no_data_available');
    if (filters.city !== 'all') {
      topRegionDisplay = `${filters.city}, ${filters.state}`;
    } else if (filters.state !== 'all') {
        topRegionDisplay = filters.state;
    } else {
        const regionSales = data.reduce((acc, item) => {
            const key = item.state;
            acc[key] = (acc[key] || 0) + item.quantity;
            return acc;
        }, {} as Record<string, number>);

        let topState = '';
        let maxRegionSales = 0;
        for (const region in regionSales) {
            if(regionSales[region] > maxRegionSales) {
                maxRegionSales = regionSales[region];
                topState = region;
            }
        }
        topRegionDisplay = topState || t('all_states');
    }


    return { totalVehicles, topModel, topRegion: topRegionDisplay };
  }, [data, filters, t]);

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('total_vehicles')}</CardTitle>
          <Users2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalVehicles.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{t('total_vehicles_description')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('main_model')}</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{topModel}</div>
          <p className="text-xs text-muted-foreground">{t('main_model_description')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('main_region')}</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{topRegion}</div>
          <p className="text-xs text-muted-foreground">{t('main_region_description')}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatCards;
