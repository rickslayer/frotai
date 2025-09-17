
'use client';

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import type { Filters, DashboardData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users2, Map, Factory, Star, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { stateToRegionMap } from '@/lib/regions';

interface StatCardsProps {
  data: DashboardData;
  filters: Filters;
}


const StatCards: FC<StatCardsProps> = ({ data, filters }) => {
  const { t } = useTranslation();
  const [topRegion, setTopRegion] = useState('-');
  const [isRegionLoading, setIsRegionLoading] = useState(false);

  useEffect(() => {
    const determineTopRegion = () => {
      setIsRegionLoading(true);

      // Priority 1: If a region filter is active, it dictates the region.
      if (filters.region) {
        setTopRegion(t(filters.region as any));
        setIsRegionLoading(false);
        return;
      }
      
      // Priority 2: If a state filter is active, derive from it.
      if (filters.state) {
        const regionForState = stateToRegionMap[filters.state];
        if (regionForState) {
          setTopRegion(t(regionForState as any));
          setIsRegionLoading(false)
          return;
        }
      }

      // Priority 3: Fallback to the region with the most vehicles from the returned data.
      if (data.regionalData && data.regionalData.length > 0) {
        const sortedRegions = [...data.regionalData].sort((a, b) => b.quantity - a.quantity);
        if (sortedRegions[0] && sortedRegions[0].quantity > 0) {
          setTopRegion(t(sortedRegions[0].name as any));
          setIsRegionLoading(false);
          return;
        }
      }

      // Final Fallback
      setTopRegion('-');
      setIsRegionLoading(false);
    };

    determineTopRegion();
  }, [data.regionalData, filters.region, filters.state, t]);


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
          <CardTitle className="text-sm font-medium">{t('main_manufacturer')}</CardTitle>
          <Factory className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{data.topManufacturer?.name || '-'}</div>
          <p className="text-xs text-muted-foreground uppercase">{t('main_manufacturer_description')}</p>
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
          <Star className="h-4 w-4 text-muted-foreground" />
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
          <div className="text-2xl font-bold truncate uppercase h-8 flex items-center">
            {isRegionLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : topRegion}
          </div>
          <p className="text-xs text-muted-foreground uppercase">{t('main_region_description')}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatCards;
