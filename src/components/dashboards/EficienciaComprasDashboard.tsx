import { useMemo } from "react";
import { DemandaConsolidada } from "@/types/data";
import { KpiCard } from "../dashboard/KpiCard";
import { BarChart } from "../charts/BarChart";
import { calculateLeadTime, isDateBeforeToday, parseDateString } from "@/utils/data-processing";
import { CheckCheck, PackageCheck, Clock, CalendarDays } from "lucide-react";
import { isBefore, isEqual, getDay } from "date-fns";

interface DashboardProps {
  data: DemandaConsolidada[];
}

export const EficienciaComprasDashboard = ({ data }: DashboardProps) => {

  const processedMetrics = useMemo(() => {
    let totalPedidosComPrazo = 0;
    let pedidosNoPrazo = 0;
    let pedidosAtrasados = 0;
    let totalSolicitado = 0;
    let totalEntregue = 0;
    const entregaPorFornecedor: { [key: string]: { totalDays: number; count: number } } = {};
    const solicitacoesPorDia: { [key: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    data.forEach(d => {
      const dataEntrega = parseDateString(d.actualDeliveryDate);
      const dataPrevisao = parseDateString(d.deliveryForecast);
      const requestDate = parseDateString(d.requestDate);

      if (dataEntrega && dataPrevisao) {
        totalPedidosComPrazo++;
        if (isBefore(dataEntrega, dataPrevisao) || isEqual(dataEntrega, dataPrevisao)) {
          pedidosNoPrazo++;
        } else {
          pedidosAtrasados++;
        }
      }
      
      if (d.requestedQuantity > 0) {
        totalSolicitado += d.requestedQuantity;
        totalEntregue += d.deliveredQuantity;
      }

      const leadExterno = calculateLeadTime(d.orderDate, d.actualDeliveryDate);
      if (leadExterno !== null && d.supplier) {
        if (!entregaPorFornecedor[d.supplier]) {
          entregaPorFornecedor[d.supplier] = { totalDays: 0, count: 0 };
        }
        entregaPorFornecedor[d.supplier].totalDays += leadExterno;
        entregaPorFornecedor[d.supplier].count++;
      }

      if (requestDate) {
        const diaSemana = getDay(requestDate); // Domingo = 0, Sábado = 6
        solicitacoesPorDia[diaSemana]++;
      }
    });

    const otdPercent = totalPedidosComPrazo > 0 ? ((pedidosNoPrazo / totalPedidosComPrazo) * 100).toFixed(1) : 'N/A';
    const atrasoPercent = totalPedidosComPrazo > 0 ? ((pedidosAtrasados / totalPedidosComPrazo) * 100).toFixed(1) : 'N/A';
    const atendimentoPercent = totalSolicitado > 0 ? ((totalEntregue / totalSolicitado) * 100).toFixed(1) : 'N/A';

    const entregaFornecedorChartData = Object.entries(entregaPorFornecedor)
      .map(([name, { totalDays, count }]) => ({
        name,
        value: count > 0 ? totalDays / count : 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const diasDaSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const solicitacoesDiaChartData = Object.entries(solicitacoesPorDia).map(([dia, total]) => ({
      name: diasDaSemana[parseInt(dia)],
      value: total,
    }));

    return {
      otdPercent,
      atrasoPercent,
      atendimentoPercent,
      entregaFornecedorChartData,
      solicitacoesDiaChartData,
    };
  }, [data]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <KpiCard 
          title="OTD - On Time Delivery" 
          value={`${processedMetrics.otdPercent}%`} 
          icon={CheckCheck} 
          iconColorClass="text-positive"
          tooltipText="Percentual de pedidos entregues na data prevista ou antes."
        />
        <KpiCard 
          title="Taxa de Atendimento" 
          value={`${processedMetrics.atendimentoPercent}%`} 
          icon={PackageCheck} 
          iconColorClass="text-positive"
          tooltipText="Percentual da quantidade total de itens solicitados que foi efetivamente entregue."
        />
        <KpiCard 
          title="Pedidos com Atraso" 
          value={`${processedMetrics.atrasoPercent}%`} 
          icon={Clock} 
          iconColorClass="text-destructive"
          tooltipText="Percentual de pedidos entregues após a data prevista."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2">
        <BarChart 
          title="Top 10 - Tempo Médio de Entrega por Fornecedor (dias)" 
          data={processedMetrics.entregaFornecedorChartData} 
          dataKeyX="value" 
          dataKeyY="name" 
          barKey="value" 
          layout="vertical" 
          barColor="hsl(var(--primary))" 
        />
        <BarChart 
          title="Volume de Solicitações por Dia da Semana" 
          data={processedMetrics.solicitacoesDiaChartData} 
          dataKeyX="name" 
          dataKeyY="value" 
          barKey="value" 
          layout="horizontal" 
          barColor="hsl(var(--primary))" 
        />
      </div>
    </div>
  );
};