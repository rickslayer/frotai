import { cache } from 'react';
import type { Vehicle, FilterOptions, Filters } from '@/types';

// Helper function to extract manufacturer, model, and version from "Modelo"
const extractVehicleDetails = (modelString: string) => {
    const parts = modelString.split(' ');
    const model = parts[0] || ''; 
    const version = parts.slice(1).join(' '); 
    return { model, version };
};

// Maps the raw data from the API to the Vehicle type used in the frontend.
const mapApiDataToVehicle = (apiData: any[]): Vehicle[] => {
  return apiData.map((row: any) => {
    const { model, version } = extractVehicleDetails(row.Modelo || '');
    return {
      id: row.ID,
      manufacturer: row.Marca,
      model: model,
      version: version,
      fullName: row.Modelo || '',
      year: parseInt(row.Ano, 10) || 0,
      quantity: parseInt(row.Quantidade, 10) || 0,
      state: row.UF,
      city: row.Município,
    };
  }).filter((v: Vehicle) => v.quantity > 0 && v.year > 0);
};

// Fetches vehicle data from the API based on the provided filters.
export const getFleetData = async (filters?: Partial<Filters>): Promise<Vehicle[]> => {
  try {
    const query = new URLSearchParams();
    if (filters) {
      if (filters.region && filters.region !== 'all') query.append('region', filters.region);
      if (filters.state && filters.state !== 'all') query.append('state', filters.state);
      if (filters.city && filters.city !== 'all') query.append('city', filters.city);
      if (filters.manufacturer && filters.manufacturer !== 'all') query.append('manufacturer', filters.manufacturer);
      if (filters.model && filters.model !== 'all') query.append('model', filters.model);
      if (filters.year && filters.year !== 'all') query.append('year', String(filters.year));
      // Version filter needs to be handled carefully if API expects multiple values
      if (filters.version && filters.version.length > 0) {
        filters.version.forEach(v => query.append('version', v));
      }
    }

    const res = await fetch(`/api/carros?${query.toString()}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch data from API: ${res.statusText}`);
    }
    const data = await res.json();
    return mapApiDataToVehicle(data);
  } catch (error) {
    console.error("Error fetching or parsing data from API:", error);
    return [];
  }
};

// Fetches all unique filter options once.
export const getFilterOptions = cache(async (): Promise<FilterOptions> => {
    try {
        const res = await fetch(`/api/carros`);
        if (!res.ok) {
            throw new Error(`Failed to fetch initial options: ${res.statusText}`);
        }
        const allData = mapApiDataToVehicle(await res.json());

        const manufacturers = [...new Set(allData.map(item => item.manufacturer))].sort();
        const models = [...new Set(allData.map(item => item.model))].sort();
        const versions = [...new Set(allData.map(item => item.version))].sort();
        const states = [...new Set(allData.map(item => item.state))].sort();
        const cities = [...new Set(allData.map(item => item.city))].sort();
        const years = [...new Set(allData.map(item => item.year))].sort((a, b) => b - a);

        return { regions: [], states, cities, manufacturers, models, versions, years };
    } catch (error) {
        console.error("Error fetching filter options:", error);
        return { regions: [], states: [], cities: [], manufacturers: [], models: [], versions: [], years: [] };
    }
});
