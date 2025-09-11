
import type { Vehicle } from '@/types';
import { cache } from 'react';

// This function now fetches data from the API endpoint instead of the local JSON file.
export const getFleetData = cache(async (): Promise<Vehicle[]> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9002';
  try {
    console.log("Fetching fleet data from API...");
    // The collection name 'vehicles' is hardcoded for this specific application context.
    const response = await fetch(`${baseUrl}/api/vehicles`, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Failed to fetch fleet data: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Success! ${data.length} records fetched from the API.`);
    return data as Vehicle[];

  } catch (error) {
    console.error("Error fetching data from API:", (error as Error).message);
    // In case of an API error, return an empty array to prevent the app from crashing.
    return [];
  }
});
