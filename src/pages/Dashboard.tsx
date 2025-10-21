import Header from "@/components/Header";
import { useSession } from "@/contexts/SessionContext";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
  const { session, loading } = useSession();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!session) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="p-8">
        <h2 className="text-2xl font-semibold mb-6">Quadro de Demandas</h2>
        {/* O componente KanbanBoard será adicionado aqui em breve */}
        <div className="p-10 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
          O quadro Kanban aparecerá aqui.
        </div>
      </main>
    </div>
  );
};

export default Dashboard;