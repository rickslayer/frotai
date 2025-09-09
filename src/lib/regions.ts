
import type { Vehicle } from '@/types';

type StatePath = {
  id: string;
  d: string;
};

type Region = {
  name: 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';
  states: StatePath[];
};

export type RegionData = {
  region: string;
  quantity: number;
};

const stateToRegionMap: Record<string, Region['name']> = {
    AC: 'Norte', RO: 'Norte', AM: 'Norte', RR: 'Norte', PA: 'Norte', AP: 'Norte', TO: 'Norte',
    MA: 'Nordeste', PI: 'Nordeste', CE: 'Nordeste', RN: 'Nordeste', PB: 'Nordeste', PE: 'Nordeste', AL: 'Nordeste', SE: 'Nordeste', BA: 'Nordeste',
    MT: 'Centro-Oeste', MS: 'Centro-Oeste', GO: 'Centro-Oeste', DF: 'Centro-Oeste',
    SP: 'Sudeste', RJ: 'Sudeste', ES: 'Sudeste', MG: 'Sudeste',
    PR: 'Sul', SC: 'Sul', RS: 'Sul',
};

// Simplified paths for Brazil states SVG
// In a real application, these would be more accurate.
export const brazilRegions: Region[] = [
  {
    name: 'Norte',
    states: [
      { id: 'AC', d: 'M93,253l-14,33l-1,3l-13,32l-12,17l-12,8l-4,8l-5,5l-5,10l-12,14l-11,2l-8-5l-4-12l-1-10l-3-11l3-13l9-10l5-12l10-10l12-3l12-1l12,5l10,13l13,11l7,13l2,14l-4,10z' },
      { id: 'AM', d: 'M202,238l-42,12l-57,15l-12,11l-24,42l-10,3l-13-14l-3-17l4-10l1-14l4-10l13-11l10-13l12-5l12,1l12-3l10-10l5,12l9,10l3,13l-3,11l1,10l4,12l8,5l11-2l12-14l5-10l5-5l4-8l12-8l12-17l13-32l1-3l14-33l3-45l-4-32l-18-42l-32-13l-30,4l-22,23l-11,18l-1,10l-5,10l-10,4z' },
      { id: 'AP', d: 'M262,118l-12,30l-11,35l-20-1l-19-14l-4,13l-2,30l10,25l-2,8l-37-3l-10-4l5-10l1-10l11-18l22-23l30-4l32,13l18,42l4,32l-3,45z' },
      { id: 'PA', d: 'M344,248l-19-2l-32-15l-20-25l-42-12l-22-29l-37,3l2-8l-10-25l-2-30l4-13l19,14l20,1l11-35l12-30l30,12l29,38l3,4l10,32l7,22l-11,20z' },
      { id: "RO", d: "M151,338 l-39,12 l-12,33 l-1,3 l-13,32 l-12,17 l10-20 l15-25 l20-30 l22-15 l18-5z" },
      { id: 'RR', d: 'M202,89l-42-12l-57-15l-12-11l-24-42l50,10 l40,20 l30,30 l15,20z' },
      { id: 'TO', d: 'M344,320 l-19-2l-32-15l-20-25l-42-12l-22-29 l-10, 40 l15,35 l20,20 l30,5 l40-10z' }
    ],
  },
  {
    name: 'Nordeste',
    states: [
      { id: 'AL', d: 'M490,366l-11-2l-10-10l-11-4l-9,7l-5,11l-2,5l10,12l13,5l15-10z' },
      { id: 'BA', d: 'M450,450l-20-60l-30-45l-15-32l-22-10l-22-2l10,12l2,5l5,11l9,7l11,4l10,10l11,2l10,20l5,25l-2,20l-10,22l-12,10z' },
      { id: 'CE', d: 'M452,260 l-30,12l-29,38l-3,4l-10,32l25-10 l30-20 l15-30z' },
      { id: 'MA', d: 'M381,250l-37-12l-19,2l-32,15l-20,25l-42,12l-22,29l40,5 l35,15 l30,22z' },
      { id: 'PB', d: 'M490,320l-15-10l-13-5l-10-12l2-5l5-11l9-7l11-4l20,5 l15,10z' },
      { id: 'PE', d: 'M490,340l-15-10l-13-5l-10-12l-10,20 l-5,15 l10,10 l13,5 l15,10z' },
      { id: 'PI', d: 'M410,300l-30,40l-20,35l-15,20l22,2 l22,10l15,32l30,45l-20-50z' },
      { id: 'RN', d: 'M482,290l-30-30l-15,30l20,5 l15,10z' },
      { id: 'SE', d: 'M478,390l-12-10l-10-22l2-20l-5-25l-10-20l10,12 l13,5 l15,10z' }
    ],
  },
  {
    name: 'Centro-Oeste',
    states: [
      { id: 'DF', d: 'M370,420 a 5 5 0 0 1 0 10 a 5 5 0 0 1 0 -10' },
      { id: 'GO', d: 'M340,430l-30-40l-25-35l-15-20l-22-2l-22-10l-15-32l50,20 l40,30 l30,40z' },
      { id: 'MS', d: 'M250,500l-20-40l-25-35l-15-20l-22-2l-22-10l-15-32l50,20 l40,30 l30,40z' },
      { id: 'MT', d: 'M250,380l-30-40l-25-35l-15-20l-22-2l-22-10l-15-32l50,20 l40,30 l30,40z' }
    ],
  },
  {
    name: 'Sudeste',
    states: [
      { id: 'ES', d: 'M450,500 l-5-25 l-2-20 l10,10 l-3,35z' },
      { id: 'MG', d: 'M380,520l-30-40l-25-35l-15-20l-22-2l-22-10l-15-32l50,20 l40,30 l30,40z' },
      { id: 'RJ', d: 'M420,530l-30-10l-5-25l3,35 l12,5z' },
      { id: 'SP', d: 'M350,550l-30-40l-25-35l-15-20l-22-2l-22-10l-15-32l50,20 l40,30 l30,40z' }
    ],
  },
  {
    name: 'Sul',
    states: [
        { id: 'PR', d: 'M320,580l-30-40l-25-35l-15-20l-22-2l-22-10l-15-32l50,20 l40,30 l30,40z' },
        { id: 'RS', d: 'M280,650l-30-40l-25-35l-15-20l-22-2l-22-10l-15-32l50,20 l40,30 l30,40z' },
        { id: 'SC', d: 'M300,610l-30-40l-25-35l-15-20l-22-2l-22-10l-15-32l50,20 l40,30 l30,40z' }
    ],
  },
];


export function getRegionData(data: Vehicle[]): RegionData[] {
  const regionalTotals: Record<string, number> = {
    'Norte': 0,
    'Nordeste': 0,
    'Centro-Oeste': 0,
    'Sudeste': 0,
    'Sul': 0,
  };

  data.forEach(vehicle => {
    // Assuming state is in 'UF' format like 'RJ'
    const region = stateToRegionMap[vehicle.state.toUpperCase()];
    if (region) {
      regionalTotals[region] += vehicle.quantity;
    }
  });

  return Object.entries(regionalTotals)
    .map(([region, quantity]) => ({ region, quantity }))
    .filter(item => item.quantity > 0);
}
