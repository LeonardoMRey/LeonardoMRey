import { useMemo } from "react";
import { DemandaConsolidada } from "@/types/data";
import { KpiCard } from "../dashboard/KpiCard";
import { BarChart } from "../charts/BarChart";
import { LineChart } from "../charts/LineChart";
import { Clock, TrendingUp } from "lucide-react";
import { calculateLeadTime, parseDateString } from "@/utils/data-processing";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { VolumeChart } from "../charts/VolumeChart";

interface DashboardProps {
  data: DemandaConsolidada[];
}

export const DesempenhoOperacionalDashboard = ({ data }: DashboardProps) => {

  const processedMetrics = useMemo(() => {
    let leadTimeTotalDays = 0, leadTimeTotalCount = 0;
    let leadTimeInternoDays = 0, leadTimeInternoCount = 0;
    let leadTimeExternoDays = 0, leadTimeExternoCount = 0;
    const leadTimePorMes: { [key: string]: { total: number; count: number } } = {};
    const gargalosInternos: { [key: string]: number } = {};
    const volumePorMes: { [key: string]: { solicitacoes: number; pedidos: number } } = {};

    data.forEach(d => {
      const requestDate = parseDateString(d.requestDate);
      const orderDate = parseDateString(d.orderDate);
      const actualDeliveryDate = parseDateString(d.actualDeliveryDate);
      
      // Cálculo de Lead Time
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

      // Cálculo de Gargalos Internos
      if (!d.orderNumber && !d.requestStatus?.toLowerCase().includes('cancelada') && d.buyer) {
        gargalosInternos[d.buyer] = (gargalosInternos[d.buyer] || 0) + 1;
      }

      // Cálculo de Volume Mensal
      if (requestDate) {
        const monthKey = format(requestDate, "MMM/yy", { locale: ptBR });
        if (!volumePorMes[monthKey]) volumePorMes[monthKey] = { solicitacoes: 0, pedidos: 0 };
        volumePorMes[monthKey].solicitacoes++;
        if (d.orderNumber) {
          volumePorMes[monthKey].pedidos++;
        }
      }
    });
    
    // Função auxiliar para ordenar meses
    const sortMonths = (a: { month: string }, b: { month: string }) => {
      const monthOrder = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      const dateA = new Date(20 + a.month.slice(-2), monthOrder.indexOf(a.month.slice(0, 3).toLowerCase()));
      const dateB = new Date(20 + b.month.slice(-2), monthOrder.indexOf(b.month.slice(0, 3).toLowerCase()));
      return dateA.getTime() - dateB.getTime();
    };

    const leadTimeEvolucaoChartData = Object.entries(leadTimePorMes)
      .map(([month, { total, count }]) => ({ month, "Lead Time Médio": count > 0 ? total / count : 0 }))
      .sort(sortMonths);

    const volumeMensalChartData = Object.entries(volumePorMes)
      .map(([month, { solicitacoes, pedidos }]) => ({ month, "Solicitações": solicitacoes, "Pedidos": pedidos }))
      .sort(sortMonths);

    return {
      leadTimeTotalMedio: leadTimeTotalCount > 0 ? (leadTimeTotalDays / leadTimeTotalCount).toFixed(1) : 'N/A',
      leadTimeInternoMedio: leadTimeInternoCount > 0 ? (leadTimeInternoDays / leadTimeInternoCount).toFixed(1) : 'N/A',
      leadTimeExternoMedio: leadTimeExternoCount > 0 ? (leadTimeExternoDays / leadTimeExternoCount).toFixed(1) : 'N/A',
      leadTimeEvolucaoChartData,
      gargalosInternosChartData: Object.entries(gargalosInternos).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      volumeMensalChartData,
    };
  }, [data]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <KpiCard 
          title="Lead Time Total Médio" 
          value={`${processedMetrics.leadTimeTotalMedio} dias`} 
          icon={TrendingUp} 
          iconColorClass="text-warning"
          tooltipText="Tempo médio entre a data da solicitação e a entrega efetiva na obra."
        />
        <KpiCard 
          title="Tempo Médio: Solicitação -> Pedido" 
          value={`${processedMetrics.leadTimeInternoMedio} dias`} 
          icon={Clock} 
          iconColorClass="text-warning"
          tooltipText="Tempo médio entre a data da solicitação e a data de emissão do pedido de compra."
        />
        <KpiCard 
          title="Lead Time Externo (Fornecedor)" 
          value={`${processedMetrics.leadTimeExternoMedio} dias`} 
          icon={Clock} 
          iconColorClass="text-warning"
          tooltipText="Tempo médio entre a data do pedido de compra e a entrega efetiva na obra."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8">
        <VolumeChart 
          title="Volume Mensal de Solicitações e Pedidos" 
          data={processedMetrics.volumeMensalChartData} 
          dataKeyX="month" 
          barKey1="Solicitações"
          barKey2="Pedidos"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2">
        <LineChart 
          title="Evolução do Lead Time Total Médio" 
          data={processedMetrics.leadTimeEvolucaoChartData} 
          dataKeyX="month" 
          lines={[{ dataKey: "Lead Time Médio", stroke: "hsl(var(--primary))", name: "Lead Time Médio" }]} 
        />
        <BarChart 
          title="Gargalos Internos por Solicitante" 
          data={processedMetrics.gargalosInternosChartData} 
          dataKeyX="value" 
          dataKeyY="name" 
          barKey="value" 
          layout="vertical" 
          barColor="hsl(var(--primary))" 
        />
      </div>
    </div>
  );
};