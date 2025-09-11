
import type { Vehicle, Filters, FilterOptions } from '@/types';
import { cache } from 'react';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9002';

// Fetches the actual vehicle data based on filters
export const getFleetData = cache(async (filters: Filters): Promise<Vehicle[]> => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          params.append(key, value.join(','));
        }
      } else if (value !== 'all') {
        params.append(key, String(value));
      }
    }
  });

  try {
    const response = await fetch(`${baseUrl}/api/vehicles?${params.toString()}`, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Failed to fetch fleet data: ${response.statusText}`);
    }

    const data = await response.json();
    return data as Vehicle[];
  } catch (error) {
    console.error("Error fetching data from API:", (error as Error).message);
    return [];
  }
});


// Fetches the available options for filters, can be dependent on other filters
export const getFilterOptions = cache(async (filters: Partial<Filters>): Promise<FilterOptions> => {
   const params = new URLSearchParams();
   
   Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        if (value.length > 0) params.append(key, value.join(','));
      } else if (value !== 'all') {
        params.append(key, String(value));
      }
    }
  });

  try {
    // This could be a separate endpoint, but for simplicity we reuse the main one
    // and derive options from the returned data on the client.
    // A more optimized approach would be a dedicated API endpoint `/api/filter-options`
    // that runs aggregation queries on the database.
    const response = await fetch(`${baseUrl}/api/vehicles?${params.toString()}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch filter options: ${response.statusText}`);
    }
    const data: Vehicle[] = await response.json();

    // Derive options from the data
    const states = [...new Set(data.map(item => item.state))].sort();
    const cities = [...new Set(data.map(item => item.city))].sort();
    const manufacturers = [...new Set(data.map(item => item.manufacturer))].sort();
    const models = [...new Set(data.map(item => item.model))].sort();
    const versions = [...new Set(data.map(item => item.version || 'base'))].sort();
    const years = [...new Set(data.map(item => item.year))].sort((a, b) => b - a);

    // If a filter is already applied, the options should be based on that.
    // If not, we still need to provide the full list for the first dropdown.
    // This logic gets complex, so for now we'll handle the initial state call separately
    // on the client, and this function will derive subsequent options.
    
    return { states, cities, manufacturers, models, versions, years };
  } catch (error) {
     console.error("Error fetching filter options from API:", (error as Error).message);
     return { states:[], cities: [], manufacturers: [], models: [], versions: [], years: [] };
  }
});
