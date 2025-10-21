import { DesempenhoOperacionalDashboard } from "@/components/dashboards/DesempenhoOperacionalDashboard";
import { useDashboardData } from "@/components/layout/Layout";

const DesempenhoOperacional = () => {
  const { data } = useDashboardData();
  return <DesempenhoOperacionalDashboard data={data} />;
};

export default DesempenhoOperacional;