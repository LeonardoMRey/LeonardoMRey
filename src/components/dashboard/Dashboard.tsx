import { useMemo } from "react";
import { DemandaConsolidada } from "@/types/data";
import { ScrollArea } from "@/components/ui/scroll-area";
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

      // Lead Times
      const leadTimeTotal = (requestDate && actualDeliveryDate) ? calculateLeadTime(d.requestDate, d.actualDeliveryDate) : null;
      if (leadTimeTotal !== null) {
        leadTimeTotalDays += leadTimeTotal;
        leadTimeTotalCount++;
        if (requestDate) {
          const monthKey = format(requestDate, "MMM/yy", { locale: ptBR });
          if (!leadTimePorMes[monthKey]) leadTimePorMes[monthKey] = { total: 0, count: 0 };
          leadTimePorMes[monthKey].total += leadTimeTotal;
          leadTimePorMes[monthKey].count++;
        }
      }
      const leadTimeInterno = (requestDate && orderDate) ? calculateLeadTime(d.requestDate, d.orderDate) : null;
      if (leadTimeInterno !== null) {
        leadTimeInternoDays += leadTimeInterno;
        leadTimeInternoCount++;
      }
      const leadTimeExterno = (orderDate && actualDeliveryDate) ? calculateLeadTime(d.orderDate, d.actualDeliveryDate) : null;
      if (leadTimeExterno !== null) {
        leadTimeExternoDays += leadTimeExterno;
        leadTimeExternoCount++;
      }

      // OTD & Atrasos
      if (actualDeliveryDate && forecastDeliveryDate) {
        totalEntregasConsideradas++;
        if (!isAfter(actualDeliveryDate, forecastDeliveryDate)) entregasNoPrazo++;
        else if (d.supplier) atrasosPorFornecedor[d.supplier] = (atrasosPorFornecedor[d.supplier] || 0) + 1;
      }
      
      // Spend
      if (d.project && d.invoiceValue > 0) {
        spendPorObra[d.project] = (spendPorObra[d.project] || 0) + d.invoiceValue;
      }
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
    <ScrollArea className="h-[calc(100vh-200px)] pr-4">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Coluna Esquerda: Visão Geral */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <KpiCard title="Lead Time Total Médio" value={`${processedMetrics.leadTimeTotalMedio} dias`} icon={TrendingUp} iconColorClass="text-warning" description="Ciclo: Solicitação -> Entrega." />
            <KpiCard title="Entrega no Prazo (OTD)" value={`${processedMetrics.otdRate}%`} icon={Target} iconColorClass="text-positive" description="Pedidos entregues até a data prevista." />
            <KpiCard title="Taxa de Atendimento (Fill Rate)" value={`${processedMetrics.fillRate}%`} icon={CheckCircle} iconColorClass="text-positive" description="% de pedidos 'Totalmente Entregue'." />
            <KpiCard title="Lead Time Interno Médio" value={`${processedMetrics.leadTimeInternoMedio} dias`} icon={Clock} iconColorClass="text-warning" description="Eficiência: Solicitação -> Pedido." />
            <KpiCard title="Lead Time Externo Médio" value={`${processedMetrics.leadTimeExternoMedio} dias`} icon={Clock} iconColorClass="text-warning" description="Fornecedor: Pedido -> Entrega." />
          </div>
          <LineChart
            title="Evolução do Lead Time Total Médio (por Mês)"
            data={processedMetrics.leadTimeEvolucaoChartData}
            dataKeyX="month"
            lines={[{ dataKey: "Lead Time Médio", stroke: "hsl(var(--primary))", name: "Lead Time Médio" }]}
            height={350}
          />
        </div>

        {/* Coluna Direita: Análise e Ação */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <ActionTabs data={data} />
          <BarChart title="Spend por Obra" data={processedMetrics.spendPorObraChartData} dataKeyX="name" dataKeyY="value" barKey="value" layout="horizontal" height={350} barColor="hsl(var(--primary))" isCurrency={true} />
          <BarChart title="Top 10 Fornecedores com Atraso" data={processedMetrics.atrasosPorFornecedorChartData} dataKeyX="value" dataKeyY="name" barKey="value" layout="vertical" height={350} barColor="hsl(var(--destructive))" />
        </div>

      </div>
    </ScrollArea>
  );
};