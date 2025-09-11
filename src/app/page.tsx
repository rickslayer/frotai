
import DashboardClient from "@/components/dashboard-client";
import { getFleetData, getFilterOptions } from '@/lib/data';

export default async function Home() {
  const initialData = await getFleetData({});
  const initialFilterOptions = await getFilterOptions({});

  return (
    <main>
      <DashboardClient initialData={initialData} initialFilterOptions={initialFilterOptions} />
    </main>
  );
}
