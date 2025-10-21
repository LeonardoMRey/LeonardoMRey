import { GestaoFinanceiraDashboard } from "@/components/dashboards/GestaoFinanceiraDashboard";
import { useDashboardData } from "@/components/layout/Layout";

const GestaoFinanceira = () => {
  const { data } = useDashboardData();
  return <GestaoFinanceiraDashboard data={data} />;
};

export default GestaoFinanceira;