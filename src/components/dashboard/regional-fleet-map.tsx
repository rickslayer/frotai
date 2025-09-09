
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { RegionData } from '@/lib/regions';
import { brazilRegions } from '@/lib/regions';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';


const regionColorMapping: Record<string, string> = {
  'Norte': 'var(--region-norte)',
  'Nordeste': 'var(--region-nordeste)',
  'Centro-Oeste': 'var(--region-centro-oeste)',
  'Sudeste': 'var(--region-sudeste)',
  'Sul': 'var(--region-sul)',
};

const BrazilMap = ({ data }: { data: RegionData[] }) => {
  const { t } = useTranslation();

  const dataMap = useMemo(() => {
    return new Map(data.map(d => [d.region, d.quantity]));
  }, [data]);


  const getRegionFill = (regionName: string) => {
    const quantity = dataMap.get(regionName);
    if (quantity && quantity > 0) {
      return regionColorMapping[regionName] || 'fill-muted/30';
    }
    return 'hsl(var(--muted))';
  };

  return (
    <div className='flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 w-full h-full'>
       <div className='w-full lg:w-2/3'>
        <TooltipProvider>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 800 800"
            aria-label="Mapa do Brasil"
            className="w-full h-auto"
          >
            <g>
              {brazilRegions.map(region => (
                <Tooltip key={region.name}>
                  <TooltipTrigger asChild>
                    <g>
                      {region.states.map(state => (
                        <path
                          key={state.id}
                          d={state.d}
                          className="transition-all duration-300"
                          fill={getRegionFill(region.name)}
                          stroke="hsl(var(--card))"
                          strokeWidth="2"
                        />
                      ))}
                    </g>
                  </TooltipTrigger>
                  {dataMap.has(region.name) && (
                    <TooltipContent>
                      <div className='flex items-center gap-2'>
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: regionColorMapping[region.name] }}
                        />
                        <p className="font-bold">{t(region.name)}</p>
                      </div>
                      <p>{t('total_vehicles')}: {dataMap.get(region.name)?.toLocaleString() ?? 0}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              ))}
            </g>
          </svg>
        </TooltipProvider>
      </div>
      <div className='w-full lg:w-1/3 flex lg:flex-col justify-center gap-2'>
        {Object.entries(regionColorMapping).map(([name, color]) => (
          <div key={name} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: color }}></div>
            <span className="text-sm text-muted-foreground">{t(name)}</span>
          </div>
        ))}
      </div>
    </div>
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
      <CardContent className="flex-grow flex items-center justify-center p-2 sm:p-4">
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
