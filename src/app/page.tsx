
import DashboardClient from "@/components/dashboard-client";
import { getFleetData } from "@/lib/data";
import type { Vehicle } from "@/types";

export default function Home() {
  const fleetData = getFleetData();

  return (
    <main>
      <DashboardClient 
        initialData={fleetData} 
      />
    </main>
  );
}
