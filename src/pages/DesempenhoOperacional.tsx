import { Dashboard } from "@/components/dashboard/Dashboard";
import { useDashboardData } from "@/components/layout/Layout";

const DesempenhoOperacional = () => {
  const { data } = useDashboardData();
  return <Dashboard data={data} />;
};

export default DesempenhoOperacional;