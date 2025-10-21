import { useMemo } from "react";
import { DemandaConsolidada } from "@/types/data";
import { KpiCard } from "./KpiCard";
import { ActionTabs } from "./ActionTabs";
import { BarChart } from "../charts/BarChart";
import { LineChart } from "../charts/LineChart";
import { CheckCircle, Clock, Target, TrendingUp } from "lucide-react";
import { calculateLeadTime, parseDateString } from "@/utils/data-processing";
import { isAfter, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardProps {
  data: DemandaConsolidada[];
}

export const Dashboard = ({ data }: DashboardProps) => {

  const processedMetrics = useMemo(() => {
    let leadTimeTotalDays = 0, leadTimeTotalCount = 0;
    let leadTimeInternoDays = 0, leadTimeInternoCount = 0;
    let leadTimeExternoDays = 0, leadTimeExternoCount = 0;
    let entregasNoPrazo = 0, totalEntregasConsideradas = 0;
    const pedidos = data.filter(d => d.orderNumber);
    const uniquePedidos = [...new Set(pedidos.map(p => p.orderNumber))];
    const totalPedidosUnicos = uniquePedidos.length;
    const spendPorObra: { [key: string]: number } = {};
    const atrasosPorFornecedor: { [key: string]: number } = {};
    const leadTimePorMes: { [key: string]: { total: number; count: number } } = {};

    data.forEach(d => {
      const requestDate = parseDateString(d.requestDate);
      const orderDate = parseDateString(d.orderDate);
      const actualDeliveryDate = parseDateString(d.actualDeliveryDate);
      const forecastDeliveryDate = parseDateString(d.deliveryForecast);
      const leadTimeTotal = (requestDate && actualDeliveryDate) ? calculateLeadTime(d.requestDate, d.actualDeliveryDate) : null;
      if (leadTimeTotal !== null) {
        leadTimeTotalDays += leadTimeTotal; leadTimeTotalCount++;
        if (requestDate) {
          const monthKey = format(requestDate, "MMM/yy", { locale: ptBR });
          if (!leadTimePorMes[monthKey]) leadTimePorMes[monthKey] = { total: 0, count: 0 };
          leadTimePorMes[monthKey].total += leadTimeTotal; leadTimePorMes[monthKey].count++;
        }
      }
      const leadTimeInterno = (requestDate && orderDate) ? calculateLeadTime(d.requestDate, d.orderDate) : null;
      if (leadTimeInterno !== null) { leadTimeInternoDays += leadTimeInterno; leadTimeInternoCount++; }
      const leadTimeExterno = (orderDate && actualDeliveryDate) ? calculateLeadTime(d.orderDate, d.actualDeliveryDate) : null;
      if (leadTimeExterno !== null) { leadTimeExternoDays += leadTimeExterno; leadTimeExternoCount++; }
      if (actualDeliveryDate && forecastDeliveryDate) {
        totalEntregasConsideradas++;
        if (!isAfter(actualDeliveryDate, forecastDeliveryDate)) entregasNoPrazo++;
        else if (d.supplier) atrasosPorFornecedor[d.supplier] = (atrasosPorFornecedor[d.supplier] || 0) + 1;
      }
      if (d.project && d.invoiceValue > 0) { spendPorObra[d.project] = (spendPorObra[d.project] || 0) + d.invoiceValue; }
    });
    
    const pedidosEntreguesSet = new Set(pedidos.filter(p => p.orderStatus?.toLowerCase().includes('totalmente entregue')).map(p => p.orderNumber));
    const fillRate = totalPedidosUnicos > 0 ? ((pedidosEntreguesSet.size / totalPedidosUnicos) * 100).toFixed(1) : 'N/A';
    const leadTimeEvolucaoChartData = Object.entries(leadTimePorMes)
      .map(([month, { total, count }]) => ({ month, "Lead Time Médio": count > 0 ? total / count : 0 }))
      .sort((a, b) => new Date(20 + a.month.slice(-2), ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].indexOf(a.month.slice(0, 3).toLowerCase())).getTime() - new Date(20 + b.month.slice(-2), ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'].indexOf(b.month.slice(0, 3).toLowerCase())).getTime());

    return {
      leadTimeTotalMedio: leadTimeTotalCount > 0 ? (leadTimeTotalDays / leadTimeTotalCount).toFixed(1) : 'N/A',
      leadTimeInternoMedio: leadTimeInternoCount > 0 ? (leadTimeInternoDays / leadTimeInternoCount).toFixed(1) : 'N/A',
      leadTimeExternoMedio: leadTimeExternoCount > 0 ? (leadTimeExternoDays / leadTimeExternoCount).toFixed(1) : 'N/A',
      otdRate: totalEntregasConsideradas > 0 ? ((entregasNoPrazo / totalEntregasConsideradas) * 100).toFixed(1) : 'N/A',
      fillRate,
      spendPorObraChartData: Object.entries(spendPorObra).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      atrasosPorFornecedorChartData: Object.entries(atrasosPorFornecedor).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10),
      leadTimeEvolucaoChartData,
    };
  }, [data]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-5">
        <KpiCard title="Lead Time Total Médio" value={`${processedMetrics.leadTimeTotalMedio} dias`} icon={TrendingUp} iconColorClass="text-warning" />
        <KpiCard title="Entrega no Prazo (OTD)" value={`${processedMetrics.otdRate}%`} icon={Target} iconColorClass="text-positive" />
        <KpiCard title="Taxa de Atendimento" value={`${processedMetrics.fillRate}%`} icon={CheckCircle} iconColorClass="text-positive" />
        <KpiCard title="Lead Time Interno" value={`${processedMetrics.leadTimeInternoMedio} dias`} icon={Clock} iconColorClass="text-warning" />
        <KpiCard title="Lead Time Externo" value={`${processedMetrics.leadTimeExternoMedio} dias`} icon={Clock} iconColorClass="text-warning" />
      </div>

      <div className="grid auto-rows-fr gap-4 md:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LineChart title="Evolução do Lead Time Total Médio" data={processedMetrics.leadTimeEvolucaoChartData} dataKeyX="month" lines={[{ dataKey: "Lead Time Médio", stroke: "hsl(var(--primary))", name: "Lead Time Médio" }]} />
        </div>
        <div className="lg:col-span-1">
          <ActionTabs data={data} />
        </div>
        <div className="lg:col-span-2">
          <BarChart title="Spend por Obra" data={processedMetrics.spendPorObraChartData} dataKeyX="name" dataKeyY="value" barKey="value" layout="horizontal" barColor="hsl(var(--primary))" isCurrency={true} />
        </div>
        <div className="lg:col-span-1">
          <BarChart title="Top 10 Fornecedores com Atraso" data={processedMetrics.atrasosPorFornecedorChartData} dataKeyX="value" dataKeyY="name" barKey="value" layout="vertical" barColor="hsl(var(--destructive))" />
        </div>
      </div>
    </div>
  );
};