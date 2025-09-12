import DashboardClient from "@/components/dashboard-client";

export default async function Home() {
  // A busca de dados agora é feita no lado do cliente para melhor interatividade com os filtros.
  return (
    <main>
      <DashboardClient />
    </main>
  );
}
