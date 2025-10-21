import { EficienciaComprasDashboard } from "@/components/dashboards/EficienciaComprasDashboard";
import { useDashboardData } from "@/components/layout/Layout";

const EficienciaCompras = () => {
  const { data } = useDashboardData();
  return <EficienciaComprasDashboard data={data} />;
};

export default EficienciaCompras;