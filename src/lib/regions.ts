
import type { Vehicle } from '@/types';

export type RegionData = {
  name: string;
  quantity: number;
  fill: string;
};

export const stateToRegionMap: Record<string, string> = {
    'AC': 'Norte', 'AP': 'Norte', 'AM': 'Norte', 'PA': 'Norte', 'RO': 'Norte', 'RR': 'Norte', 'TO': 'Norte',
    'AL': 'Nordeste', 'BA': 'Nordeste', 'CE': 'Nordeste', 'MA': 'Nordeste', 'PB': 'Nordeste', 'PE': 'Nordeste', 'PI': 'Nordeste', 'RN': 'Nordeste', 'SE': 'Nordeste',
    'GO': 'Centro-Oeste', 'MT': 'Centro-Oeste', 'MS': 'Centro-Oeste', 'DF': 'Centro-Oeste',
    'ES': 'Sudeste', 'MG': 'Sudeste', 'RJ': 'Sudeste', 'SP': 'Sudeste',
    'PR': 'Sul', 'RS': 'Sul', 'SC': 'Sul',
};

export const regionToStatesMap: Record<string, string[]> = {
    'Norte': ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'],
    'Nordeste': ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
    'Centro-Oeste': ['GO', 'MT', 'MS', 'DF'],
    'Sudeste': ['ES', 'MG', 'RJ', 'SP'],
    'Sul': ['PR', 'RS', 'SC'],
};


const regionColors: Record<string, string> = {
  'Sudeste': 'hsl(var(--chart-1))',
  'Nordeste': 'hsl(var(--chart-2))',
  'Sul': 'hsl(var(--chart-3))',
  'Norte': 'hsl(var(--chart-4))',
  'Centro-Oeste': 'hsl(var(--chart-5))',
};

export const allRegions = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];


export function getRegionData(data: Vehicle[], allData: Vehicle[]): RegionData[] {
  const sourceData = data.length > 0 ? data : allData;

  const regionalTotals: Record<string, number> = {
    'Norte': 0,
    'Nordeste': 0,
    'Centro-Oeste': 0,
    'Sudeste': 0,
    'Sul': 0,
  };

  sourceData.forEach(vehicle => {
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
