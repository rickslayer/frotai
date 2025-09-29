'use client';

import type { FC } from 'react';
import type { DashboardData, TopEntity } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users2, Map, Globe, Flag, Star, Car } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

interface StatCardsProps {
  data: DashboardData;
  isLoading?: boolean;
}

const StatCard: FC<{title: string, value: string | null, description: string, icon: React.ReactNode, isLoading?: boolean, className?: string}> = ({ title, value, description, icon, isLoading, className }) => {
  const { t } = useTranslation();
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-7 w-1/2" />
            <Skeleton className="h-3 w-full mt-2" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold truncate">{value || '-'}</div>
            <p className="text-xs text-muted-foreground uppercase">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};


const StatCards: FC<StatCardsProps> = ({ data, isLoading }) => {
  const { t } = useTranslation();
  
  const isCardLoading = (entity: TopEntity | null | undefined) => {
    if (isLoading) return true;
    if (entity === undefined) return true;
    return false;
  }

  const handleCityClick = () => {
    if (data.topCity?.name) {
      const query = encodeURIComponent(data.topCity.name);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  }

  const handleModelImageSearch = () => {
    if (data.topOverallModel?.name) {
        const query = encodeURIComponent(data.topOverallModel.name);
        window.open(`https://www.google.com/search?tbm=isch&q=${query}`, '_blank');
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      <StatCard
        title={t('total_vehicles')}
        value={isLoading ? null : data.totalVehicles.toLocaleString()}
        description={t('total_vehicles_description')}
        icon={<Users2 className="h-4 w-4 text-muted-foreground" />}
        isLoading={isLoading}
      />
      <div 
        onClick={handleModelImageSearch} 
        className={data.topOverallModel?.name ? "cursor-pointer" : "cursor-default"}
        title={data.topOverallModel?.name ? `${t('main_overall_model')}: ${data.topOverallModel.name}`: t('main_overall_model')}
       >
        <StatCard
          title={t('main_overall_model')}
          value={data.topOverallModel?.name || null}
          description={t('main_overall_model_description')}
          icon={<Car className="h-4 w-4 text-muted-foreground" />}
          isLoading={isCardLoading(data.topOverallModel)}
          className={cn(data.topOverallModel?.name && "transition-colors border-2 border-transparent hover:border-primary")}
        />
      </div>
      <StatCard
        title={t('main_state')}
        value={data.topState?.name || null}
        description={t('main_state_description')}
        icon={<Flag className="h-4 w-4 text-muted-foreground" />}
        isLoading={isCardLoading(data.topState)}
      />
       <div 
        onClick={handleCityClick} 
        className={data.topCity?.name ? "cursor-pointer" : "cursor-default"}
        title={data.topCity?.name ? `${t('main_city')}: ${data.topCity.name}`: t('main_city')}
       >
        <StatCard
          title={t('main_city')}
          value={data.topCity?.name || null}
          description={t('main_city_description')}
          icon={<Map className="h-4 w-4 text-muted-foreground" />}
          isLoading={isCardLoading(data.topCity)}
          className={cn(data.topCity?.name && "transition-colors border-2 border-transparent hover:border-primary")}
        />
       </div>
    </div>
  );
};

export default StatCards;
