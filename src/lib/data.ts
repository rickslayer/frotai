

import type { Vehicle, Filters, FilterOptions } from '@/types';
import { cache } from 'react';
import { getVehicles } from './api-logic';

// Fetches the actual vehicle data based on filters
export const getFleetData = cache(async (filters: Filters): Promise<Vehicle[]> => {
  try {
    const data = await getVehicles(filters);
    return data;
  } catch (error) {
    console.error("Error fetching data directly:", (error as Error).message);
    return [];
  }
});


// Fetches the available options for filters, can be dependent on other filters
export const getFilterOptions = cache(async (filters: Partial<Filters>): Promise<FilterOptions> => {
  try {
    // This could be a separate endpoint, but for simplicity we reuse the main one
    // and derive options from the returned data on the client.
    // A more optimized approach would be a dedicated API endpoint `/api/filter-options`
    // that runs aggregation queries on the database.
    const data: Vehicle[] = await getVehicles(filters);

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

