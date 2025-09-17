
'use client';

import type { FC } from 'react';
import type { DashboardData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users2, Map, Globe, Flag, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StatCardsProps {
  data: DashboardData;
}


const StatCards: FC<StatCardsProps> = ({ data }) => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
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
          <CardTitle className="text-sm font-medium">{t('main_region')}</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{data.topRegion?.name ? t(data.topRegion.name as any) : '-'}</div>
          <p className="text-xs text-muted-foreground uppercase">{t('main_region_description')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('main_state')}</CardTitle>
          <Flag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{data.topState?.name || '-'}</div>
          <p className="text-xs text-muted-foreground uppercase">{t('main_state_description')}</p>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('main_city')}</CardTitle>
          <Map className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{data.topCity?.name || '-'}</div>
          <p className="text-xs text-muted-foreground uppercase">{t('main_city_description')}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatCards;
