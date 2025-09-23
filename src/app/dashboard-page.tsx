import DashboardClient from '@/components/dashboard-client';
import { getInitialFilterOptions } from '@/lib/api-logic';

export default async function DashboardPage() {
  const initialFilterOptions = await getInitialFilterOptions();
  return <DashboardClient initialFilterOptions={initialFilterOptions} />;
}
