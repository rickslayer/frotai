import DashboardClient from "@/components/dashboard-client";
import { getSalesData, getFilterOptions } from "@/lib/data";

export default function Home() {
  const salesData = getSalesData();
  const filterOptions = getFilterOptions(salesData);

  return (
    <main>
      <DashboardClient initialData={salesData} filterOptions={filterOptions} />
    </main>
  );
}
