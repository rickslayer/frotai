
import DashboardClient from "@/components/dashboard-client";

export default async function Home() {
  // Data will now be fetched on the client side based on interactions
  return (
    <main>
      <DashboardClient />
    </main>
  );
}
