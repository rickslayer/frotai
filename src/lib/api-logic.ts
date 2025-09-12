import { cache } from 'react';
import type { Vehicle, FilterOptions } from '@/types';

// Helper function to extract manufacturer, model, and version from "Modelo"
const extractVehicleDetails = (modelString: string) => {
    // A simple split might not be robust enough. 
    // This is a placeholder, a more complex logic might be needed based on real data.
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

// Fetches all vehicle data from the new API endpoint.
const loadAndParseData = cache(async (): Promise<Vehicle[]> => {
  try {
    // Using a relative path which will be handled by the rewrite in next.config.js
    const res = await fetch('/api/carros', { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch data from API: ${res.statusText}`);
    }
    const data = await res.json();
    return mapApiDataToVehicle(data);
  } catch (error) {
    console.error("Error fetching or parsing data from API:", error);
    return [];
  }
});

export const getFleetData = async (): Promise<Vehicle[]> => {
  return await loadAndParseData();
};

// Generates filter options based on the entire dataset.
export const getFilterOptions = async (): Promise<FilterOptions> => {
    const allData = await getFleetData();

    const manufacturers = [...new Set(allData.map(item => item.manufacturer))].sort();
    const models = [...new Set(allData.map(item => item.model))].sort();
    const versions = [...new Set(allData.map(item => item.version))].sort();
    const states = [...new Set(allData.map(item => item.state))].sort();
    const cities = [...new Set(allData.map(item => item.city))].sort();
    const years = [...new Set(allData.map(item => item.year))].sort((a, b) => b - a);

    return { regions: [], states, cities, manufacturers, models, versions, years };
};
