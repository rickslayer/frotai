
'use client';

import type { FC } from 'react';
import type { DashboardData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users2, Factory, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StatCardsProps {
  data: DashboardData;
}


const StatCards: FC<StatCardsProps> = ({ data }) => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
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
          <CardTitle className="text-sm font-medium">{t('main_model')}</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{data.topModel.name}</div>
          <p className="text-xs text-muted-foreground uppercase">{t('main_model_description')}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatCards;
