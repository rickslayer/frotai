import type { Vehicle } from '@/types';
import fs from 'fs';
import path from 'path';

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

  // Generate data for the last 15 years
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
                quantity: Math.floor(Math.random() * (currentYear - year + 1) * 10) + 10, // Older cars are more numerous
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
    const files = fs.readdirSync(dataDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    if (jsonFiles.length > 0) {
      console.log(`Found ${jsonFiles.length} JSON file(s) in src/data. Parsing...`);
      jsonFiles.forEach(file => {
        const filePath = path.join(dataDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const vehicles: Vehicle[] = JSON.parse(fileContent);
        allVehicles = allVehicles.concat(vehicles);
      });
      console.log(`Successfully parsed ${allVehicles.length} total records from JSON files.`);
      fleetData = allVehicles;
    } else {
      throw new Error("No JSON files found.");
    }
  } catch (error) {
    console.warn("Could not read or parse JSON data from src/data. Falling back to mock data.", error);
    allVehicles = generateMockFleetData();
  }

  fleetData = allVehicles;
  return fleetData;
}
