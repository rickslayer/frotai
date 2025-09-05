
import DashboardClient from "@/components/dashboard-client";
import { getFleetData } from "@/lib/data";
import type { Vehicle, FilterOptions } from "@/types";

function getFilterOptions(data: Vehicle[]): FilterOptions {
  const manufacturers = [...new Set(data.map(item => item.manufacturer))].sort();
  const models = [...new Set(data.map(item => item.model))].sort();
  const versions = [...new Set(data.map(item => item.version))].sort();
  const states = [...new Set(data.map(item => item.state))].sort();
  const cities = [...new Set(data.map(item => item.city))].sort();
  const categories = [...new Set(data.map(item => item.category))].sort() as FilterOptions['categories'];
  const years = [...new Set(data.map(item => item.year))].sort((a, b) => b - a);

  return { manufacturers, models, versions, states, cities, categories, years };
}

export default function Home() {
  const fleetData = getFleetData();
  const allFilterOptions = getFilterOptions(fleetData);
  const dynamicFilterOptions = getFilterOptions(fleetData);

  return (
    <main>
      <DashboardClient 
        initialData={fleetData} 
        allFilterOptions={allFilterOptions} 
        dynamicFilterOptions={dynamicFilterOptions}
      />
    </main>
  );
}
