
'use client';

import type { FC } from 'react';
import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Map, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RegionData } from '@/types';
import { brazilRegions, regionColors, regionToStatesMap } from '@/lib/regions';

interface RegionalFleetAnalysisProps {
  data: RegionData[];
  total: number;
  selectedRegion?: string;
}

const BrazilMap: FC<{ data: RegionData[] }> = ({ data }) => {
  const activeRegions = useMemo(() => new Set(data.map(d => d.name)), [data]);

  return (
    <div className="relative w-full aspect-square max-w-[400px] mx-auto">
        <svg viewBox="0 0 700 600" className="w-full h-full">
            <g id="brazil-map">
                {brazilRegions.map(region => (
                    <g key={region.name} id={region.name}>
                        {region.states.map(state => (
                            <path
                                key={state.id}
                                d={state.d}
                                className={cn(
                                    'stroke-background stroke-[1.5]',
                                    activeRegions.has(region.name)
                                    ? 'fill-[var(--region-color)] opacity-100'
                                    : 'fill-muted/70 opacity-50',
                                )}
                                style={{ '--region-color': regionColors[region.name] } as React.CSSProperties}
                            >
                                <title>{state.id}</title>
                            </path>
                        ))}
                    </g>
                ))}
            </g>
        </svg>
    </div>
  );
};


const RegionalFleetAnalysis: FC<RegionalFleetAnalysisProps> = ({ data, total, selectedRegion }) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    let sourceData = data;
    // If a region is selected, filter data to show only states of that region
    if (selectedRegion && regionToStatesMap[selectedRegion]) {
        const statesInRegion = new Set(regionToStatesMap[selectedRegion]);
        sourceData = data.filter(item => statesInRegion.has(item.name));
    }
    
    if (!sourceData || sourceData.length === 0 || total === 0) return [];
    
    return sourceData
      .map(item => ({
        ...item,
        percentage: (item.quantity / total) * 100,
        fill: regionColors[item.name] || 'hsl(var(--primary))'
      }))
      .filter(item => item.quantity > 0)
      .sort((a,b) => b.quantity - a.quantity);
  }, [data, total, selectedRegion]);

  const title = selectedRegion ? t('state_fleet_analysis') : t('regional_fleet_analysis');
  const description = selectedRegion ? t('state_fleet_analysis_description') : t('regional_fleet_analysis_description');


  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-center gap-4">
        {chartData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1 space-y-4">
              {chartData.map((item, index) => (
                <div key={item.name} className="grid grid-cols-[1fr_auto_auto] items-center gap-4">
                  <div className='flex items-center gap-3'>
                    <Pin style={{ color: item.fill }} className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium truncate text-sm">{selectedRegion ? item.name : t(item.name as any)}</span>
                  </div>
                  <div className="text-right">
                    <Badge variant={index === 0 ? "default" : "secondary"}>
                      {item.quantity.toLocaleString()}
                    </Badge>
                  </div>
                  <div className="w-20 text-right">
                     <Progress value={item.percentage} className="h-2" indicatorClassName={cn(index === 0 && 'bg-primary')} style={{'--indicator-color': item.fill} as any} />
                  </div>
                </div>
              ))}
            </div>
            <div className="order-1 md:order-2">
                 <BrazilMap data={data} />
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-center p-8">
            <div className='flex flex-col items-center gap-2'>
                <Map className='h-10 w-10 text-primary/30' />
                <p>{t('no_data_for_regional_chart')}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RegionalFleetAnalysis;
