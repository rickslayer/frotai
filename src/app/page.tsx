import DashboardClient from "@/components/dashboard-client";
import { getFleetData, getFilterOptions } from "@/lib/api-logic";

export default async function Home() {
  // Fetch initial data on the server
  const initialData = await getFleetData({});
  const initialFilterOptions = await getFilterOptions({});

  return (
    <main>
      <DashboardClient 
        initialData={initialData} 
        initialFilterOptions={initialFilterOptions} 
      />
    </main>
  );
}
