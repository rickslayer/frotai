
import type { Vehicle } from '@/types';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

let fleetData: Vehicle[] | null = null;

function generateMockFleetData(): Vehicle[] {
  const manufacturers = ['Fiat', 'Chevrolet', 'Volkswagen', 'Hyundai', 'Toyota', 'Jeep', 'Renault', 'Honda'];
  const models = {
    Fiat: [{name: 'Strada', versions: ['Endurance', 'Freedom', 'Volcano'], category: 'Pickup'}, {name: 'Mobi', versions: ['Like', 'Trekking'], category: 'Hatchback'}, {name: 'Toro', versions: ['Endurance', 'Freedom', 'Volcano'], category: 'Pickup'}],
    Chevrolet: [{name: 'Onix', versions: ['1.0', 'LT', 'Premier'], category: 'Hatchback'}, {name: 'Onix Plus', versions: ['LT', 'Midnight', 'Premier'], category: 'Sedan'}, {name: 'Tracker', versions: ['1.0 Turbo', 'LT', 'Premier'], category: 'SUV'}],
    Volkswagen: [{name: 'Polo', versions: ['Track', 'MSI', 'Highline'], category: 'Hatchback'}, {name: 'T-Cross', versions: ['Sense', 'Comfortline', 'Highline'], category: 'SUV'}, {name: 'Saveiro', versions: ['Robust', 'Trendline', 'Cross'], category: 'Pickup'}],
    Hyundai: [{name: 'HB20', versions: ['Sense Plus', 'Comfort Plus', 'Platinum Plus'], category: 'Hatchback'}, {name: 'Creta', versions: ['Action', 'Comfort Plus', 'Ultimate'], category: 'SUV'}],
    Toyota: [{name: 'Corolla', versions: ['GLi', 'XEi', 'Altis Premium'], category: 'Sedan'}, {name: 'Hilux', versions: ['SR', 'SRV', 'SRX'], category: 'Pickup'}, {name: 'Corolla Cross', versions: ['XR', 'XRE', 'GR-Sport'], category: 'SUV'}],
    Jeep: [{name: 'Compass', versions: ['Sport', 'Longitude', 'Limited'], category: 'SUV'}, {name: 'Renegade', versions: ['Sport', 'Longitude', 'S'], category: 'SUV'}],
    Renault: [{name: 'Kwid', versions: ['Zen', 'Intense', 'Outsider'], category: 'Hatchback'}, {name: 'Duster', versions: ['Intense Plus', 'Iconic Plus'], category: 'SUV'}],
    Honda: [{name: 'HR-V', versions: ['EX', 'EXL', 'Touring'], category: 'SUV'}, {name: 'City', versions: ['EX', 'EXL', 'Touring'], category: 'Sedan'}],
  };

  const locations = [
    { state: 'São Paulo', cities: ['São Paulo', 'Guarulhos', 'Campinas'] },
    { state: 'Rio de Janeiro', cities: ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias'] },
    { state: 'Minas Gerais', cities: ['Belo Horizonte', 'Uberlândia', 'Contagem'] },
    { state: 'Bahia', cities: ['Salvador', 'Feira de Santana', 'Vitória da Conquista'] },
  ];
  
  const data: Vehicle[] = [];
  const currentYear = new Date().getFullYear();
  let idCounter = 1;

  for (let year = currentYear; year > currentYear - 15; year--) {
    locations.forEach(location => {
      location.cities.forEach(city => {
        manufacturers.forEach(manufacturer => {
          // @ts-ignore
          models[manufacturer].forEach(modelInfo => {
            modelInfo.versions.forEach(version => {
              data.push({
                id: (idCounter++).toString(),
                manufacturer,
                model: modelInfo.name,
                version,
                // @ts-ignore
                category: modelInfo.category,
                state: location.state,
                city,
                quantity: Math.floor(Math.random() * (currentYear - year + 1) * 10) + 10, 
                year,
              });
            });
          });
        });
      });
    });
  }

  return data;
}

export function getFleetData(): Vehicle[] {
  if (fleetData) {
    return fleetData;
  }

  const dataDir = path.join(process.cwd(), 'src', 'data');
  let allVehicles: Vehicle[] = [];

  try {
    const files = fs.readdirSync(dataDir).filter(file => !file.startsWith('.') && file !== 'sample-data.json');
    
    if (files.length === 0) {
      throw new Error("No data files found in src/data to parse.");
    }
    
    console.log(`Found ${files.length} data file(s) in src/data. Parsing...`);

    files.forEach(file => {
      const filePath = path.join(dataDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');

      const parsed = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        delimiter: ';',
      });

      const vehicles = parsed.data.map((row: any, index: number) => ({
          id: `${file}-${index}`,
          manufacturer: row.montadora || row.manufacturer,
          model: row.modelo || row.model,
          version: row.versao || row.version,
          category: row.categoria || row.category,
          state: row.uf || row.state,
          city: row.cidade || row.city,
          quantity: parseInt(row.quantidade || row.quantity, 10) || 0,
          year: parseInt(row.ano_fabricacao || row.year, 10) || 0,
      })) as Vehicle[];
      
      allVehicles = allVehicles.concat(vehicles.filter(v => v.manufacturer && v.model && v.year));
    });

    if (allVehicles.length === 0) {
      throw new Error("Data files were found, but no valid vehicle records could be parsed.");
    }
    
    console.log(`Successfully parsed ${allVehicles.length} total records from all files.`);
    fleetData = allVehicles;
    
  } catch (error) {
    console.warn(`Could not read or parse data files from src/data. Falling back to mock data. Error: ${(error as Error).message}`);
    fleetData = generateMockFleetData();
  }

  return fleetData;
}
