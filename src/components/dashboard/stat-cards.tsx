
'use client';

import type { FC } from 'react';
import { useMemo, useState, useEffect } from 'react';
import type { Filters, DashboardData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users2, Map, Factory } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { stateToRegionMap } from '@/lib/regions';

const WheelIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
    <path d="M12 10.5a1.5 1.5 0 1 0 1.5 1.5 1.5 1.5 0 0 0-1.5-1.5z" />
    <path d="m7.22 7.22 9.56 9.56-1.41 1.41-9.56-9.56z" />
    <path d="m16.78 7.22-9.56 9.56 1.41 1.41 9.56-9.56z" />
    <path d="M4 11h16v2H4z" />
</svg>
);


interface StatCardsProps {
  data: DashboardData;
  filters: Filters;
}

const StatCards: FC<StatCardsProps> = ({ data, filters }) => {
  const { t } = useTranslation();

  const { topRegion } = useMemo(() => {
    let topRegionName = t('no_data_available');
    if (data.regionalData.length > 0) {
      const sortedRegions = [...data.regionalData].sort((a, b) => b.quantity - a.quantity);
      if (sortedRegions[0].quantity > 0) {
        topRegionName = sortedRegions[0].name;
      }
    }
    return { topRegion: t(topRegionName as any) };
  }, [data.regionalData, t]);


  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('total_vehicles')}</CardTitle>
          <Users2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalVehicles.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground uppercase">{t('total_vehicles_description')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('main_state_manufacturer')}</CardTitle>
          <Factory className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{data.topStateManufacturer?.name || (filters.state && filters.state !== 'all' ? t('no_data_available') : t('select_a_state'))}</div>
          <p className="text-xs text-muted-foreground uppercase">{t('main_state_manufacturer_description')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('main_city')}</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{data.topCity.name}</div>
          <p className="text-xs text-muted-foreground uppercase">{t('main_city_description')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('main_model')}</CardTitle>
          <WheelIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{data.topModel.name}</div>
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
