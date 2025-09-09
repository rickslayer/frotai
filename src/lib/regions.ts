
import type { Vehicle } from '@/types';

export type RegionData = {
  name: string;
  quantity: number;
  fill: string;
};

const stateToRegionMap: Record<string, string> = {
    AC: 'Norte', RO: 'Norte', AM: 'Norte', RR: 'Norte', PA: 'Norte', AP: 'Norte', TO: 'Norte',
    MA: 'Nordeste', PI: 'Nordeste', CE: 'Nordeste', RN: 'Nordeste', PB: 'Nordeste', PE: 'Nordeste', AL: 'Nordeste', SE: 'Nordeste', BA: 'Nordeste',
    MT: 'Centro-Oeste', MS: 'Centro-Oeste', GO: 'Centro-Oeste', DF: 'Centro-Oeste',
    SP: 'Sudeste', RJ: 'Sudeste', ES: 'Sudeste', MG: 'Sudeste',
    PR: 'Sul', SC: 'Sul', RS: 'Sul',
};

const regionColors: Record<string, string> = {
  'Norte': 'hsl(var(--chart-1))',
  'Nordeste': 'hsl(var(--chart-2))',
  'Centro-Oeste': 'hsl(var(--chart-3))',
  'Sudeste': 'hsl(var(--chart-4))',
  'Sul': 'hsl(var(--chart-5))',
};


export function getRegionData(data: Vehicle[]): RegionData[] {
  const regionalTotals: Record<string, number> = {
    'Norte': 0,
    'Nordeste': 0,
    'Centro-Oeste': 0,
    'Sudeste': 0,
    'Sul': 0,
  };

  data.forEach(vehicle => {
    const region = stateToRegionMap[vehicle.state.toUpperCase()];
    if (region) {
      regionalTotals[region] += vehicle.quantity;
    }
  });

  return Object.entries(regionalTotals)
    .map(([region, quantity]) => ({ 
        name: region, 
        quantity,
        fill: regionColors[region] || 'hsl(var(--muted))'
    }))
    .filter(item => item.quantity > 0)
    .sort((a,b) => b.quantity - a.quantity);
}
