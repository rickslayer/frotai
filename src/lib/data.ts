import { cache } from 'react';
import fs from 'fs/promises';
import path from 'path';
import type { Vehicle, FilterOptions, Filters } from '@/types';

// Memoize the data loading and parsing process.
const loadAndParseData = cache(async (): Promise<Vehicle[]> => {
  const jsonFilePath = path.join(process.cwd(), 'src', 'data', 'rj.json');
  try {
    const jsonFile = await fs.readFile(jsonFilePath, 'utf8');
    const data = JSON.parse(jsonFile);

    // Assuming the JSON is an array of objects that match the expected structure
    // or need minimal transformation.
    return data.map((row: any) => ({
      id: `${row.modelo_id}-${row.ano}-${row.uf}-${row.municipio}`,
      manufacturer: row.marca,
      model: row.modelo,
      version: row.versao,
      fullName: `${row.modelo} ${row.versao}`,
      year: parseInt(row.ano, 10) || 0,
      quantity: parseInt(row.quantity, 10) || 0,
      state: row.uf,
      city: row.municipio,
    })).filter((v: Vehicle) => v.quantity > 0 && v.year > 0);
  } catch (error) {
    console.error("Error reading or parsing rj.json:", error);
    // If the file doesn't exist or is invalid, return an empty array
    // to prevent the app from crashing.
    return [];
  }
});


export const getFleetData = cache(async (filters: Partial<Filters>): Promise<Vehicle[]> => {
  try {
    const allData = await loadAndParseData();
    if (Object.keys(filters).length === 0) {
      return allData;
    }
    
    return allData.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value || value === 'all') return true;
        const itemValue = item[key as keyof Vehicle];
        if (Array.isArray(value)) {
          return value.length === 0 || value.includes(itemValue as string);
        }
        return String(itemValue) === String(value);
      });
    });

  } catch (error) {
    console.error("Error in getFleetData:", error);
    return [];
  }
});

export const getFilterOptions = cache(async (filters: Partial<Filters>): Promise<FilterOptions> => {
  try {
    const allData = await loadAndParseData();
    
    let filteredData = allData;
    if (filters.state && filters.state !== 'all') {
        filteredData = filteredData.filter(item => item.state === filters.state);
    }
    if (filters.manufacturer && filters.manufacturer !== 'all') {
        filteredData = filteredData.filter(item => item.manufacturer === filters.manufacturer);
    }
    if (filters.model && filters.model !== 'all') {
        filteredData = filteredData.filter(item => item.model === filters.model);
    }

    const manufacturers = [...new Set(allData.map(item => item.manufacturer))].sort();
    const states = [...new Set(allData.map(item => item.state))].sort();
    
    const models = [...new Set(filteredData.map(item => item.model))].sort();
    const versions = [...new Set(filteredData.map(item => item.version))].sort();
    const cities = [...new Set(filteredData.map(item => item.city))].sort();
    const years = [...new Set(allData.map(item => item.year))].sort((a, b) => b - a);

    return { states, cities, manufacturers, models, versions, years };
  } catch (error) {
     console.error("Error fetching filter options:", (error as Error).message);
     return { states:[], cities: [], manufacturers: [], models: [], versions: [], years: [] };
  }
});
