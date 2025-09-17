
import { cache } from 'react';
import type { FilterOptions, Filters, DashboardData } from '@/types';


// Fetches aggregated dashboard data from the API based on the provided filters.
export const getFleetData = async (filters: Partial<Filters>): Promise<DashboardData> => {
  try {
    const query = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
         if (Array.isArray(value)) {
            if (value.length > 0) {
                value.forEach(v => query.append(key, v));
            }
         } else if (value !== '') {
           query.append(key, String(value));
         }
      }
    });

    const apiUrl = `/api/carros`;
    const res = await fetch(`${apiUrl}?${query.toString()}`);


    if (!res.ok) {
      const errorBody = await res.text();
      const isHtml = /<html/i.test(errorBody);
      if (isHtml) {
          console.error(`API returned an HTML error page, not JSON. Status: ${res.status}`);
          throw new Error(`Failed to fetch dashboard data: Server returned an error page (Status: ${res.statusText})`);
      }
      console.error(`API Error Response: ${errorBody}`);
      throw new Error(`Failed to fetch dashboard data: ${res.statusText}`);
    }
    
    let data;
    try {
        data = await res.json();
    } catch (e) {
        throw new Error('Failed to parse JSON response from API.');
    }


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
export const getInitialFilterOptions = cache(async (filters?: Partial<Filters>): Promise<FilterOptions> => {
  try {
    const query = new URLSearchParams();
    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== '') {
                if (Array.isArray(value)) {
                    value.forEach(v => query.append(key, v));
                } else {
                    query.append(key, String(value));
                }
            }
        });
    }

    const apiUrl = `/api/filters`;
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
    return {
      regions: [], states: [], cities: [], manufacturers: [], models: [], versions: [], years: [],
    };
  }
});
