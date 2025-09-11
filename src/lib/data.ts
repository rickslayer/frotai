import { cache } from 'react';
import Papa from 'papaparse';
import fs from 'fs/promises';
import path from 'path';
import type { Vehicle, FilterOptions, Filters } from '@/types';

// Memoize the data loading and parsing process.
const loadAndParseData = cache(async () => {
  const csvFilePath = path.join(process.cwd(), 'src', 'data', 'rj.csv');
  const csvFile = await fs.readFile(csvFilePath, 'utf8');

  return new Promise<Vehicle[]>((resolve, reject) => {
    Papa.parse<any>(csvFile, {
      header: true,
      dynamicTyping: false, // All fields are strings from CSV
      skipEmptyLines: true,
      complete: (results) => {
        const vehicles: Vehicle[] = results.data.map(row => {
          const quantity = parseInt(row.quantity, 10) || 0;
          const year = parseInt(row.ano, 10) || 0;
          return {
            id: `${row.modelo_id}-${row.ano}-${row.uf}-${row.municipio}`,
            manufacturer: row.marca,
            model: row.modelo,
            version: row.versao,
            fullName: `${row.modelo} ${row.versao}`,
            year: year,
            quantity: quantity,
            state: row.uf,
            city: row.municipio,
          };
        }).filter(v => v.quantity > 0 && v.year > 0); // Basic data validation
        resolve(vehicles);
      },
      error: (error: Error) => {
        console.error("CSV Parsing Error:", error);
        reject(error);
      },
    });
  });
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
    // For local file, we get all options first, then filter
    const allData = await loadAndParseData();
    
    let filteredData = allData;
    // Apply filters sequentially to narrow down options
    if (filters.state && filters.state !== 'all') {
        filteredData = filteredData.filter(item => item.state === filters.state);
    }
    if (filters.city && filters.city !== 'all') {
        filteredData = filteredData.filter(item => item.city === filters.city);
    }
     if (filters.manufacturer && filters.manufacturer !== 'all') {
        filteredData = filteredData.filter(item => item.manufacturer === filters.manufacturer);
    }
    if (filters.model && filters.model !== 'all') {
        filteredData = filteredData.filter(item => item.model === filters.model);
    }

    const manufacturers = [...new Set(allData.map(item => item.manufacturer))].sort();
    const states = [...new Set(allData.map(item => item.state))].sort();
    
    // Options for children are based on the currently filtered data
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
