
import { cache } from 'react';
import type { Vehicle, FilterOptions, Filters, DashboardData } from '@/types';


// Fetches aggregated dashboard data from the API based on the provided filters.
export const getFleetData = async (filters: Partial<Filters>): Promise<DashboardData> => {
  try {
    const query = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 'all') {
         if (Array.isArray(value)) {
           value.forEach(v => query.append(key, v));
         } else {
           query.append(key, String(value));
         }
      }
    });

    // Make sure the URL is correct for your environment
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/carros';
    const res = await fetch(`${apiUrl}?${query.toString()}`);

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`API Error Response: ${errorBody}`);
      throw new Error(`Failed to fetch dashboard data: ${res.statusText}`);
    }

    const data = await res.json();
    if (data.error) {
        throw new Error(`API returned an error: ${data.details || data.error}`);
    }
    return data as DashboardData;

  } catch (error) {
    console.error("Error fetching or parsing dashboard data:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to fetch dashboard data: ${error.message}`);
    }
    throw new Error('An unknown error occurred while fetching data.');
  }
};


// Fetches the initial distinct options for the filters.
export const getInitialFilterOptions = cache(async (filters?: { manufacturer?: string, model?: string }): Promise<FilterOptions> => {
  try {
    const query = new URLSearchParams();
    if (filters?.manufacturer && filters.manufacturer !== 'all') query.set('manufacturer', filters.manufacturer);
    if (filters?.model && filters.model !== 'all') query.set('model', filters.model);

    // This endpoint needs to be created. It will be responsible for fetching distinct filter values.
    const apiUrl = process.env.NEXT_PUBLIC_FILTER_API_URL || '/api/filters';
    const res = await fetch(`${apiUrl}?${query.toString()}`);
    
    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`Filter API Error Response: ${errorBody}`);
      throw new Error(`Failed to fetch filter options: ${res.statusText}`);
    }
    
    const data = await res.json();
    if (data.error) {
        throw new Error(`Filter API returned an error: ${data.details || data.error}`);
    }
    return data as FilterOptions;

  } catch (error) {
    console.error("Error fetching filter options:", error);
    // Return empty options on error to prevent crashing the UI
    return {
      regions: [], states: [], cities: [], manufacturers: [], models: [], versions: [], years: [],
    };
  }
});
