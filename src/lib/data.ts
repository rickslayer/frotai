import type { Vehicle, FilterOptions } from '@/types';

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

let fleetData: Vehicle[] = [];

function generateMockFleetData(): Vehicle[] {
  if (fleetData.length > 0) {
    return fleetData;
  }
  
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

  fleetData = data;
  return data;
}

export function getFleetData(): Vehicle[] {
  return generateMockFleetData();
}

export function getFilterOptions(data: Vehicle[]): FilterOptions {
  const manufacturers = [...new Set(data.map(item => item.manufacturer))].sort();
  const models = [...new Set(data.map(item => item.model))].sort();
  const versions = [...new Set(data.map(item => item.version))].sort();
  const states = [...new Set(data.map(item => item.state))].sort();
  const cities = [...new Set(data.map(item => item.city))].sort();
  const categories = [...new Set(data.map(item => item.category))].sort() as FilterOptions['categories'];
  const years = [...new Set(data.map(item => item.year))].sort((a, b) => b - a);

  return { manufacturers, models, versions, states, cities, categories, years };
}
