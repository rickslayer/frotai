
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { RegionData } from '@/lib/regions';
import { brazilRegions } from '@/lib/regions';
import { useTranslation } from 'react-i18next';

interface RegionalFleetMapProps {
  data: RegionData[];
}

const BrazilMap = ({ data }: { data: RegionData[] }) => {
  const { t } = useTranslation();

  const dataMap = useMemo(() => {
    return new Map(data.map(d => [d.region, d.quantity]));
  }, [data]);

  const maxQuantity = useMemo(() => {
    return Math.max(...data.map(d => d.quantity), 0);
  }, [data]);

  const getRegionColor = (regionName: string) => {
    const quantity = dataMap.get(regionName) ?? 0;
    if (quantity === 0 || maxQuantity === 0) return 'fill-muted/30';
    
    const intensity = Math.min(Math.sqrt(quantity / maxQuantity), 1);
    const hue = 220; // Blue
    const saturation = 80;
    const lightness = Math.max(25, 90 - (intensity * 60));

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  return (
    <TooltipProvider>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 600 700"
        aria-label="Mapa do Brasil"
        className="w-full h-auto"
      >
        <g stroke="#9ca3af" strokeWidth="0.5">
          {brazilRegions.map(region => (
            <Tooltip key={region.name}>
              <TooltipTrigger asChild>
                <g>
                  {region.states.map(state => (
                    <path
                      key={state.id}
                      d={state.d}
                      className="transition-all duration-300"
                      fill={getRegionColor(region.name)}
                      stroke="hsl(var(--card))"
                      strokeWidth="1.5"
                    />
                  ))}
                </g>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">{t(region.name)}</p>
                <p>{t('total_vehicles')}: {dataMap.get(region.name)?.toLocaleString() ?? 0}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </g>
      </svg>
    </TooltipProvider>
  );
};


const RegionalFleetMap = ({ data }: RegionalFleetMapProps) => {
  const { t } = useTranslation();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{t('regional_fleet_analysis')}</CardTitle>
        <CardDescription>{t('regional_fleet_analysis_description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
         {data.length > 0 ? (
            <BrazilMap data={data} />
         ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground text-center">
              {t('no_data_for_regional_map')}
            </div>
         )}
      </CardContent>
    </Card>
  );
};

export default RegionalFleetMap;
