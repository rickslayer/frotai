

import type { Vehicle, Filters, FilterOptions } from '@/types';
import { cache } from 'react';
import { getVehicles as getVehiclesFromDb } from './api-logic';

// This function is intended to be used on the server side
export const getFleetData = cache(async (filters: Filters): Promise<Vehicle[]> => {
  try {
    const data = await getVehiclesFromDb(filters);
    return data;
  } catch (error) {
    console.error("Error fetching data directly:", (error as Error).message);
    return [];
  }
});

// This function is intended to be used on the server side
export const getFilterOptions = cache(async (filters: Partial<Filters>): Promise<FilterOptions> => {
  try {
    const data: Vehicle[] = await getVehiclesFromDb(filters);

    // Derive options from the data
    const states = [...new Set(data.map(item => item.state))].sort();
    const cities = [...new Set(data.map(item => item.city))].sort();
    const manufacturers = [...new Set(data.map(item => item.manufacturer))].sort();
    const models = [...new Set(data.map(item => item.model))].sort();
    const versions = [...new Set(data.map(item => item.version || 'base'))].sort();
    const years = [...new Set(data.map(item => item.year))].sort((a, b) => b - a);
    
    return { states, cities, manufacturers, models, versions, years };
  } catch (error) {
     console.error("Error fetching filter options directly:", (error as Error).message);
     return { states:[], cities: [], manufacturers: [], models: [], versions: [], years: [] };
  }
});
