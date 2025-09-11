
'use client';

import type { FC } from 'react';
import { useMemo, useState, useEffect } from 'react';
import type { Filters, Vehicle } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, MapPin, Users2, Map, Factory } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { stateToRegionMap } from '@/lib/regions';

interface StatCardsProps {
  data: Vehicle[];
  stateData: Vehicle[];
  filters: Filters;
}

const StatCards: FC<StatCardsProps> = ({ data, stateData, filters }) => {
  const { t } = useTranslation();
  const [formattedTotalVehicles, setFormattedTotalVehicles] = useState<string>('0');

  const { totalVehicles, topCity, topModel, topRegion, topStateManufacturer } = useMemo(() => {
    if (!data.length) {
      return { totalVehicles: 0, topCity: t('no_data_available'), topModel: t('no_data_available'), topRegion: t('no_data_available'), topStateManufacturer: t('select_a_state') };
    }

    const totalVehicles = data.reduce((sum, item) => sum + item.quantity, 0);

    const citySales = data.reduce((acc, item) => {
        acc[item.city] = (acc[item.city] || 0) + item.quantity;
        return acc;
    }, {} as Record<string, number>);

    let topCity = t('no_data_available');
    let maxCitySales = 0;
    for (const city in citySales) {
        if (citySales[city] > maxCitySales) {
            maxCitySales = citySales[city];
            topCity = city;
        }
    }


    const modelSales = data.reduce((acc, item) => {
      const key = item.fullName;
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
    
    const regionSales = data.reduce((acc, item) => {
      const region = stateToRegionMap[item.state.toUpperCase()];
      if (region) {
          acc[region] = (acc[region] || 0) + item.quantity;
      }
      return acc;
    }, {} as Record<string, number>);

    let topRegion = t('no_data_available');
    let maxRegionSales = 0;
    for (const region in regionSales) {
      if (regionSales[region] > maxRegionSales) {
        maxRegionSales = regionSales[region];
        topRegion = region;
      }
    }

    let topStateManufacturer = t('select_a_state');
    if (filters.state && filters.state !== 'all') {
        const manufacturerSales = stateData.reduce((acc, item) => {
            acc[item.manufacturer] = (acc[item.manufacturer] || 0) + item.quantity;
            return acc;
        }, {} as Record<string, number>);
        
        let maxManufacturerSales = 0;
        for (const manufacturer in manufacturerSales) {
            if (manufacturerSales[manufacturer] > maxManufacturerSales) {
                maxManufacturerSales = manufacturerSales[manufacturer];
                topStateManufacturer = manufacturer;
            }
        }
    }


    return { totalVehicles, topCity, topModel, topRegion: t(topRegion as any), topStateManufacturer };
  }, [data, stateData, filters.state, t]);

  useEffect(() => {
    // Format the number on the client side to avoid hydration mismatch
    setFormattedTotalVehicles(totalVehicles.toLocaleString());
  }, [totalVehicles]);

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('total_vehicles')}</CardTitle>
          <Users2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formattedTotalVehicles}</div>
          <p className="text-xs text-muted-foreground uppercase">{t('total_vehicles_description')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('main_state_manufacturer')}</CardTitle>
          <Factory className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{topStateManufacturer}</div>
          <p className="text-xs text-muted-foreground uppercase">{t('main_state_manufacturer_description')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('main_city')}</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{topCity}</div>
          <p className="text-xs text-muted-foreground uppercase">{t('main_city_description')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('main_model')}</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{topModel}</div>
          <p className="text-xs text-muted-foreground uppercase">{t('main_model_description')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('main_region')}</CardTitle>
          <Map className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate uppercase">{topRegion}</div>
          <p className="text-xs text-muted-foreground uppercase">{t('main_region_description')}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatCards;
