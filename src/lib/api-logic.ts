import { cache } from 'react';
import type { Vehicle, FilterOptions, Filters } from '@/types';

// Maps the raw data from the API to the Vehicle type used in the frontend.
const mapApiDataToVehicle = (apiData: any[]): Vehicle[] => {
  if (!Array.isArray(apiData)) return [];
  // Since the database fields now match the Vehicle type, the mapping is direct.
  return apiData.map((row: any) => ({
    id: row.id || row._id.toString(), // Use 'id' field, fallback to '_id'
    manufacturer: row.manufacturer,
    model: row.model,
    version: row.version,
    fullName: row.fullName,
    year: parseInt(row.year, 10) || 0,
    quantity: parseInt(row.quantity, 10) || 0,
    state: row.state,
    city: row.city,
  })).filter((v: Vehicle) => v.quantity > 0 && v.year > 0);
};

// Fetches vehicle data from the API based on the provided filters.
export const getFleetData = async (filters?: Partial<Filters>): Promise<Vehicle[]> => {
  try {
    const query = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all' && (Array.isArray(value) ? value.length > 0 : true)) {
           if (Array.isArray(value)) {
             value.forEach(v => query.append(key, v));
           } else {
             query.append(key, String(value));
           }
        }
      });
    }

    const res = await fetch(`/api/carros?${query.toString()}`);
    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`API Error Response: ${errorBody}`);
      throw new Error(`Failed to fetch data from API: ${res.statusText}`);
    }
    const data = await res.json();
    if (data.error) {
        throw new Error(`API returned an error: ${data.details || data.error}`);
    }
    return mapApiDataToVehicle(data);
  } catch (error) {
    console.error("Error fetching or parsing data from API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to fetch data from API: ${error.message}`);
    }
    throw new Error('An unknown error occurred while fetching data.');
  }
};
