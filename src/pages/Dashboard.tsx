import Header from "@/components/Header";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import { useSession } from "@/contexts/SessionContext";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
  const { session, loading } = useSession();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  if (!session) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow">
        <KanbanBoard />
      </main>
    </div>
  );
};

export default Dashboard;