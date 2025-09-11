
import type { Vehicle } from '@/types';

export type RegionData = {
  name: string;
  quantity: number;
  fill: string;
};

export const stateToRegionMap: Record<string, string> = {
    'ACRE': 'Norte', 'AMAPA': 'Norte', 'AMAZONAS': 'Norte', 'PARA': 'Norte', 'RONDONIA': 'Norte', 'RORAIMA': 'Norte', 'TOCANTINS': 'Norte',
    'ALAGOAS': 'Nordeste', 'BAHIA': 'Nordeste', 'CEARA': 'Nordeste', 'MARANHAO': 'Nordeste', 'PARAIBA': 'Nordeste', 'PERNAMBUCO': 'Nordeste', 'PIAUI': 'Nordeste', 'RIO GRANDE DO NORTE': 'Nordeste', 'SERGIPE': 'Nordeste',
    'GOIAS': 'Centro-Oeste', 'MATO GROSSO': 'Centro-Oeste', 'MATO GROSSO DO SUL': 'Centro-Oeste', 'DISTRITO FEDERAL': 'Centro-Oeste',
    'ESPIRITO SANTO': 'Sudeste', 'MINAS GERAIS': 'Sudeste', 'RIO DE JANEIRO': 'Sudeste', 'SAO PAULO': 'Sudeste',
    'PARANA': 'Sul', 'RIO GRANDE DO SUL': 'Sul', 'SANTA CATARINA': 'Sul',
};


const regionColors: Record<string, string> = {
  'Sudeste': 'hsl(var(--chart-1))',
  'Nordeste': 'hsl(var(--chart-2))',
  'Sul': 'hsl(var(--chart-3))',
  'Norte': 'hsl(var(--chart-4))',
  'Centro-Oeste': 'hsl(var(--chart-5))',
};

const allRegions = ['Sudeste', 'Nordeste', 'Sul', 'Norte', 'Centro-Oeste'];


export function getRegionData(data: Vehicle[], allData: Vehicle[]): RegionData[] {
  const sourceData = data.length > 0 ? data : allData;

  const regionalTotals: Record<string, number> = {
    'Sudeste': 0,
    'Nordeste': 0,
    'Sul': 0,
    'Norte': 0,
    'Centro-Oeste': 0,
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
