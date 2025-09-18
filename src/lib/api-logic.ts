
import { cache } from 'react';
import type { FilterOptions, Filters, DashboardData } from '@/types';


// Fetches aggregated dashboard data from the API based on the provided filters.
export const getFleetData = async (filters: Partial<Filters>): Promise<DashboardData> => {
  try {
    const apiUrl = `/api/carros`;
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters || {}),
    });

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


// Fetches the initial distinct options for the filters using a POST request.
export const getInitialFilterOptions = cache(async (filters?: Partial<Filters>): Promise<FilterOptions> => {
  try {
    const apiUrl = `/api/filters`;
    const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters || {}),
    });
    
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
