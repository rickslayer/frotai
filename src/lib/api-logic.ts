
import path from 'path';
import fs from 'fs/promises';
import { cache } from 'react';
import type { Vehicle, FilterOptions } from '@/types';

// Helper function to extract manufacturer, model, and version
const extractVehicleDetails = (modelString: string) => {
    const parts = modelString.split(' ');
    const model = parts.shift() || ''; // First word is the model
    const version = parts.join(' '); // The rest is the version
    return { model, version };
};


// Memoize the data loading and parsing process.
const loadAndParseData = cache(async (): Promise<Vehicle[]> => {
  const jsonFilePath = path.join(process.cwd(), 'src', 'data', 'rj.json');
  try {
    const jsonFile = await fs.readFile(jsonFilePath, 'utf8');
    const data = JSON.parse(jsonFile);

    // Map the new data structure to the existing Vehicle type
    return data.map((row: any) => {
        const { model, version } = extractVehicleDetails(row.Modelo);
        return {
            id: row.ID,
            manufacturer: row.Marca,
            model: model,
            version: version,
            fullName: `${model} ${version}`.trim(),
            year: parseInt(row.Ano, 10) || 0,
            quantity: parseInt(row.Quantidade, 10) || 0,
            state: row.Estado,
            city: row.Município,
        }
    }).filter((v: Vehicle) => v.quantity > 0 && v.year > 0);
  } catch (error) {
    console.error("Error reading or parsing rj.json:", error);
    return [];
  }
});


export const getFleetData = async (): Promise<Vehicle[]> => {
  return await loadAndParseData();
};

export const getFilterOptions = async (): Promise<FilterOptions> => {
    const allData = await loadAndParseData();

    const manufacturers = [...new Set(allData.map(item => item.manufacturer))].sort();
    const models = [...new Set(allData.map(item => item.model))].sort();
    const versions = [...new Set(allData.map(item => item.version))].sort();
    const states = [...new Set(allData.map(item => item.state))].sort();
    const cities = [...new Set(allData.map(item => item.city))].sort();
    const years = [...new Set(allData.map(item => item.year))].sort((a, b) => b - a);

    return { states, cities, manufacturers, models, versions, years };
};

