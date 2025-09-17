import DashboardClient from "@/components/dashboard-client";
import { getInitialFilterOptions } from "@/lib/api-logic";
import type { FilterOptions } from "@/types";

export default async function Home() {
  // A busca de dados agora é feita no lado do servidor para melhor performance inicial.
  const initialFilterOptions = await getInitialFilterOptions();
  
  return (
    <main>
      <DashboardClient initialFilterOptions={initialFilterOptions} />
    </main>
  );
}
