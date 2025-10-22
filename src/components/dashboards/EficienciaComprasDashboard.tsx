import { useMemo } from "react";
import { DemandaConsolidada } from "@/types/data";
import { KpiCard } from "../dashboard/KpiCard";
import { PieChart } from "../charts/PieChart";
import { ParetoChart } from "../charts/ParetoChart";
import { StackedBarChart } from "../charts/StackedBarChart";
import { parseDateString } from "@/utils/data-processing";
import { CheckCheck, PackageCheck } from "lucide-react";
import { isBefore, isEqual } from "date-fns";

interface DashboardProps {
  data: DemandaConsolidada[];
}

export const EficienciaComprasDashboard = ({ data }: DashboardProps) => {

  const processedMetrics = useMemo(() => {
    let totalPedidosComPrazo = 0, pedidosNoPrazo = 0;
    let totalSolicitado = 0, totalEntregue = 0;
    const solicitacoesPorStatus: { [key: string]: number } = {};
    const pedidosPorAutorizacao: { [key: string]: { [key: string]: number } } = {};
    const valorPorInsumo: { [key: string]: number } = {};

    data.forEach(d => {
      const dataEntrega = parseDateString(d.actualDeliveryDate);
      const dataPrevisao = parseDateString(d.deliveryForecast);
      if (dataEntrega && dataPrevisao) {
        totalPedidosComPrazo++;
        if (isBefore(dataEntrega, dataPrevisao) || isEqual(dataEntrega, dataPrevisao)) pedidosNoPrazo++;
      }
      
      if (d.requestedQuantity > 0) {
        totalSolicitado += d.requestedQuantity;
        totalEntregue += d.deliveredQuantity;
      }

      if (d.requestStatus) solicitacoesPorStatus[d.requestStatus] = (solicitacoesPorStatus[d.requestStatus] || 0) + 1;
      
      if (d.project && d.authorizationStatus) {
        if (!pedidosPorAutorizacao[d.project]) pedidosPorAutorizacao[d.project] = {};
        pedidosPorAutorizacao[d.project][d.authorizationStatus] = (pedidosPorAutorizacao[d.project][d.authorizationStatus] || 0) + 1;
      }

      if (d.itemDescription && d.invoiceValue > 0) {
        valorPorInsumo[d.itemDescription] = (valorPorInsumo[d.itemDescription] || 0) + d.invoiceValue;
      }
    });

    const otdPercent = totalPedidosComPrazo > 0 ? ((pedidosNoPrazo / totalPedidosComPrazo) * 100).toFixed(1) : 'N/A';
    const atendimentoPercent = totalSolicitado > 0 ? ((totalEntregue / totalSolicitado) * 100).toFixed(1) : 'N/A';

    const solicitacoesStatusChartData = Object.entries(solicitacoesPorStatus).map(([name, value]) => ({ name, value }));

    const authStatusSet = new Set(data.map(d => d.authorizationStatus).filter(Boolean));
    const pedidosAutorizacaoChartData = Object.entries(pedidosPorAutorizacao).map(([name, statuses]) => ({ name, ...statuses }));

    const allSortedInsumos = Object.entries(valorPorInsumo)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const totalValorInsumos = allSortedInsumos.reduce((sum, item) => sum + item.value, 0);
    let cumulativeValue = 0;
    const allInsumosWithCumulative = allSortedInsumos.map(item => {
      cumulativeValue += item.value;
      return { ...item, cumulativePercent: (cumulativeValue / totalValorInsumos) * 100 };
    });

    const curvaABCChartData = allInsumosWithCumulative.slice(0, 20);

    return {
      otdPercent,
      atendimentoPercent,
      solicitacoesStatusChartData,
      pedidosAutorizacaoChartData,
      authStatusSet: Array.from(authStatusSet),
      curvaABCChartData,
    };
  }, [data]);

  const authStatusColors = {
    'Autorizado': 'hsl(var(--positive))',
    'Pendente': 'hsl(var(--warning))',
    'Cancelado': 'hsl(var(--destructive))',
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2">
        <KpiCard 
          title="OTD - On Time Delivery" 
          value={`${processedMetrics.otdPercent}%`} 
          icon={CheckCheck} 
          iconColorClass="text-positive"
          tooltipText="Percentual de pedidos entregues na data prevista ou antes."
          delay={0}
        />
        <KpiCard 
          title="Taxa de Atendimento" 
          value={`${processedMetrics.atendimentoPercent}%`} 
          icon={PackageCheck} 
          iconColorClass="text-positive"
          tooltipText="Percentual da quantidade total de itens solicitados que foi efetivamente entregue."
          delay={100}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2">
        <PieChart 
          title="Total de Solicitações por Situação" 
          data={processedMetrics.solicitacoesStatusChartData} 
          delay={200}
        />
        <StackedBarChart 
          title="Pedidos por Situação de Autorização" 
          data={processedMetrics.pedidosAutorizacaoChartData} 
          dataKeyX="name"
          bars={processedMetrics.authStatusSet.map(status => ({ dataKey: status, name: status, color: authStatusColors[status] || '#8884d8' }))}
          delay={300}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8">
        <ParetoChart 
          title="Curva ABC de Insumos"
          data={processedMetrics.curvaABCChartData}
          dataKeyX="name"
          barKey="value"
          lineKey="cumulativePercent"
          delay={400}
        />
      </div>
    </div>
  );
};