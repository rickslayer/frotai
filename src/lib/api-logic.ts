import path from 'path';
import fs from 'fs/promises';
import { cache } from 'react';
import type { Vehicle, FilterOptions, Filters } from '@/types';

// Memoize the data loading and parsing process.
const loadAndParseData = cache(async (): Promise<Vehicle[]> => {
  const jsonFilePath = path.join(process.cwd(), 'src', 'data', 'rj.json');
  try {
    const jsonFile = await fs.readFile(jsonFilePath, 'utf8');
    const data = JSON.parse(jsonFile);

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
    return [];
  }
});


export const getFleetData = async (filters: Partial<Filters>): Promise<Vehicle[]> => {
  const allData = await loadAndParseData();
  if (!Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : f !== 'all'))) {
      return [];
  }
  
  return allData.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value || value === 'all') return true;
      const itemValue = item[key as keyof Vehicle];
      if (Array.isArray(value)) {
        return value.length === 0 || value.includes(itemValue as string);
      }
      return String(itemValue).toLowerCase() === String(value).toLowerCase();
    });
  });
};


export const getFilterOptions = async (filters: Partial<Filters>): Promise<FilterOptions> => {
    const allData = await loadAndParseData();

    // These filters are independent and always show all options
    const states = [...new Set(allData.map(item => item.state))].sort();
    const manufacturers = [...new Set(allData.map(item => item.manufacturer))].sort();
    const years = [...new Set(allData.map(item => item.year))].sort((a, b) => b - a);

    // These filters are dependent on the parent filters
    let level1Filtered = allData;
    if (filters.state && filters.state !== 'all') {
        level1Filtered = level1Filtered.filter(item => item.state === filters.state);
    }
    
    let level2Filtered = level1Filtered;
     if (filters.manufacturer && filters.manufacturer !== 'all') {
        level2Filtered = level2Filtered.filter(item => item.manufacturer === filters.manufacturer);
    }

    let level3Filtered = level2Filtered;
    if (filters.model && filters.model !== 'all') {
        level3Filtered = level3Filtered.filter(item => item.model === filters.model);
    }
    
    const cities = [...new Set(level1Filtered.map(item => item.city))].sort();
    const models = [...new Set(level2Filtered.map(item => item.model))].sort();
    const versions = [...new Set(level3Filtered.map(item => item.version))].sort();

    return { states, cities, manufacturers, models, versions, years };
};
