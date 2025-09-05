import DashboardClient from "@/components/dashboard-client";
import { getFleetData, getFilterOptions } from "@/lib/data";

export default function Home() {
  const fleetData = getFleetData();
  const filterOptions = getFilterOptions(fleetData);

  return (
    <main>
      <DashboardClient initialData={fleetData} filterOptions={filterOptions} />
    </main>
  );
}
