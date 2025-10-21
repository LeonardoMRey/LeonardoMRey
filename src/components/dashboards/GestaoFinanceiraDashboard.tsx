import { useMemo } from "react";
import { DemandaConsolidada } from "@/types/data";
import { KpiCard } from "../dashboard/KpiCard";
import { BarChart } from "../charts/BarChart";
import { formatCurrency } from "@/utils/data-processing";
import { DollarSign, Landmark } from "lucide-react";

interface DashboardProps {
  data: DemandaConsolidada[];
}

export const GestaoFinanceiraDashboard = ({ data }: DashboardProps) => {

  const processedMetrics = useMemo(() => {
    let totalFaturado = 0;
    let itensComValor = 0;
    const gastosPorObra: { [key: string]: number } = {};
    const gastosPorComprador: { [key: string]: number } = {};

    data.forEach(d => {
      if (d.invoiceValue > 0) {
        totalFaturado += d.invoiceValue;
        itensComValor++;
        
        if (d.project) {
          gastosPorObra[d.project] = (gastosPorObra[d.project] || 0) + d.invoiceValue;
        }
        if (d.buyer) {
          gastosPorComprador[d.buyer] = (gastosPorComprador[d.buyer] || 0) + d.invoiceValue;
        }
      }
    });

    const valorMedioPorItem = itensComValor > 0 ? totalFaturado / itensComValor : 0;

    const gastosObraChartData = Object.entries(gastosPorObra)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const gastosCompradorChartData = Object.entries(gastosPorComprador)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return {
      totalFaturado,
      valorMedioPorItem,
      gastosObraChartData,
      gastosCompradorChartData,
    };
  }, [data]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2">
        <KpiCard 
          title="Valor Total Faturado" 
          value={formatCurrency(processedMetrics.totalFaturado)} 
          icon={DollarSign} 
          iconColorClass="text-positive"
          tooltipText="Soma do valor de nota de todos os itens no período e filtros selecionados."
        />
        <KpiCard 
          title="Valor Médio Faturado por Item" 
          value={formatCurrency(processedMetrics.valorMedioPorItem)} 
          icon={DollarSign} 
          iconColorClass="text-positive"
          tooltipText="Valor médio de cada item de compra que possui nota fiscal."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2">
        <BarChart 
          title="Top 10 - Gastos por Obra" 
          data={processedMetrics.gastosObraChartData} 
          dataKeyX="name" 
          dataKeyY="value" 
          barKey="value" 
          layout="horizontal" 
          barColor="hsl(var(--positive))"
          isCurrency
        />
        <BarChart 
          title="Top 10 - Gastos por Comprador" 
          data={processedMetrics.gastosCompradorChartData} 
          dataKeyX="name" 
          dataKeyY="value" 
          barKey="value" 
          layout="horizontal" 
          barColor="hsl(var(--positive))"
          isCurrency
        />
      </div>
    </div>
  );
};