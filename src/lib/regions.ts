
import type { Vehicle } from '@/types';

export type RegionData = {
  name: string;
  quantity: number;
  fill: string;
};

export const stateToRegionMap: Record<string, string> = {
    AC: 'Norte', RO: 'Norte', AM: 'Norte', RR: 'Norte', PA: 'Norte', AP: 'Norte', TO: 'Norte',
    MA: 'Nordeste', PI: 'Nordeste', CE: 'Nordeste', RN: 'Nordeste', PB: 'Nordeste', PE: 'Nordeste', AL: 'Nordeste', SE: 'Nordeste', BA: 'Nordeste',
    MT: 'Centro-Oeste', MS: 'Centro-Oeste', GO: 'Centro-Oeste', DF: 'Centro-Oeste',
    SP: 'Sudeste', RJ: 'Sudeste', ES: 'Sudeste', MG: 'Sudeste',
    PR: 'Sul', SC: 'Sul', RS: 'Sul',
};

const regionColors: Record<string, string> = {
  'Sudeste': 'hsl(var(--chart-1))',
  'Nordeste': 'hsl(var(--chart-2))',
  'Sul': 'hsl(var(--chart-3))',
  'Norte': 'hsl(var(--chart-4))',
  'Centro-Oeste': 'hsl(var(--chart-5))',
};

const allRegions = ['Sudeste', 'Nordeste', 'Sul', 'Norte', 'Centro-Oeste'];


export function getRegionData(data: Vehicle[]): RegionData[] {
  const regionalTotals: Record<string, number> = {
    'Sudeste': 0,
    'Nordeste': 0,
    'Sul': 0,
    'Norte': 0,
    'Centro-Oeste': 0,
  };

  data.forEach(vehicle => {
    const region = stateToRegionMap[vehicle.state.toUpperCase()];
    if (region) {
      regionalTotals[region] += vehicle.quantity;
    }
  });

  return allRegions.map(region => ({
    name: region,
    quantity: regionalTotals[region],
    fill: regionColors[region] || 'hsl(var(--muted))'
  }));
}
