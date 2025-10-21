import { GestaoFornecedoresDashboard } from "@/components/dashboards/GestaoFornecedoresDashboard";
import { useDashboardData } from "@/components/layout/Layout";

const GestaoFornecedores = () => {
  const { data } = useDashboardData();
  return <GestaoFornecedoresDashboard data={data} />;
};

export default GestaoFornecedores;