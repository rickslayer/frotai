import type { Sale, FilterOptions } from '@/types';
import { subMonths, format } from 'date-fns';

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

const categories = ['Sedan' , 'SUV' , 'Hatchback' , 'Pickup' , 'Van' , 'Truck'];

let salesData: Sale[] = [];

function generateMockSalesData(): Sale[] {
  if (salesData.length > 0) {
    return salesData;
  }
  
  const data: Sale[] = [];
  const today = new Date();
  let idCounter = 1;

  for (let i = 0; i < 24; i++) { // 24 months of data
    const date = subMonths(today, i);
    
    locations.forEach(location => {
      location.cities.forEach(city => {
        manufacturers.forEach(manufacturer => {
          // @ts-ignore
          models[manufacturer].forEach(modelInfo => {
            modelInfo.versions.forEach(version => {
              // Ensure each combination has at least one entry per month
              data.push({
                id: (idCounter++).toString(),
                manufacturer,
                model: modelInfo.name,
                version,
                category: modelInfo.category,
                state: location.state,
                city,
                quantity: Math.floor(Math.random() * 50) + 5, // Base sales
                date: format(date, 'yyyy-MM-dd'),
              });
            });
          });
        });
      });
    });
  }

  // Add some random peaks
  for (let i = 0; i < data.length / 10; i++) {
    const randomIndex = Math.floor(Math.random() * data.length);
    data[randomIndex].quantity += Math.floor(Math.random() * 100) + 20;
  }
  
  salesData = data;
  return data;
}

export function getSalesData(): Sale[] {
  return generateMockSalesData();
}

export function getFilterOptions(data: Sale[]): FilterOptions {
  const manufacturers = [...new Set(data.map(item => item.manufacturer))].sort();
  const models = [...new Set(data.map(item => item.model))].sort();
  const versions = [...new Set(data.map(item => item.version))].sort();
  const states = [...new Set(data.map(item => item.state))].sort();
  const cities = [...new Set(data.map(item => item.city))].sort();
  const categories = [...new Set(data.map(item => item.category))].sort();

  return { manufacturers, models, versions, states, cities, categories };
}
