import ClientLayout from './client-layout';
import DashboardPage from './dashboard-page';

export default function Home() {
  return (
    <main>
      <ClientLayout>
        <DashboardPage />
      </ClientLayout>
    </main>
  );
}
