
import DashboardClient from "@/components/dashboard-client";
import { getFleetData } from "@/lib/data";
import type { Vehicle } from "@/types";

export default async function Home() {
  const fleetData = await getFleetData();

  return (
    <main>
      <DashboardClient 
        initialData={fleetData} 
      />
    </main>
  );
}
