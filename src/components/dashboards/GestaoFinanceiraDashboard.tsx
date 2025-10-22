import { useMemo } from "react";
import { DemandaConsolidada } from "@/types/data";
import { KpiCard } from "../dashboard/KpiCard";
import { BarChart } from "../charts/BarChart";
import { formatCurrency } from "@/utils/data-processing";
import { DollarSign, Landmark, AlertTriangle } from "lucide-react";

interface DashboardProps {
  data: DemandaConsolidada[];
}

export const GestaoFinanceiraDashboard = ({ data }: DashboardProps) => {

  const processedMetrics = useMemo(() => {
    let totalFaturado = 0;
    let itensComValor = 0;
    const gastosPorObra: { [key: string]: number } = {};
    const gastosPorComprador: { [key: string]: number } = {};
    const gastosPorGrupoInsumo: { [key: string]: number } = {};
    let pagamentosPendentesValor = 0;
    const fornecedoresPendentes = new Set<string>();

    data.forEach(d => {
      if (d.invoiceValue > 0) {
        totalFaturado += d.invoiceValue;
        itensComValor++;
        
        if (d.project) gastosPorObra[d.project] = (gastosPorObra[d.project] || 0) + d.invoiceValue;
        if (d.buyer) gastosPorComprador[d.buyer] = (gastosPorComprador[d.buyer] || 0) + d.invoiceValue;
        if (d.grupoInsumo) gastosPorGrupoInsumo[d.grupoInsumo] = (gastosPorGrupoInsumo[d.grupoInsumo] || 0) + d.invoiceValue;
      }

      if (d.statusPagamento && d.statusPagamento.toLowerCase() !== 'pago' && d.invoiceValue > 0) {
        pagamentosPendentesValor += d.invoiceValue;
        if (d.supplier) fornecedoresPendentes.add(d.supplier);
      }
    });

    const valorMedioPorItem = itensComValor > 0 ? totalFaturado / itensComValor : 0;

    return {
      totalFaturado,
      valorMedioPorItem,
      pagamentosPendentesValor,
      pagamentosPendentesCount: fornecedoresPendentes.size,
      gastosObraChartData: Object.entries(gastosPorObra).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10),
      gastosCompradorChartData: Object.entries(gastosPorComprador).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10),
      gastosGrupoInsumoChartData: Object.entries(gastosPorGrupoInsumo).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    };
  }, [data]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
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
        <KpiCard 
          title="Pagamentos Não Realizados" 
          value={formatCurrency(processedMetrics.pagamentosPendentesValor)} 
          description={`${processedMetrics.pagamentosPendentesCount} fornecedores`}
          icon={AlertTriangle} 
          iconColorClass="text-warning"
          tooltipText="Mostra o total de pagamentos ainda não efetuados a fornecedores."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8">
        <BarChart 
          className="h-[700px]"
          title="Custo por Grupo de Insumo" 
          data={processedMetrics.gastosGrupoInsumoChartData} 
          dataKeyX="value" 
          dataKeyY="name" 
          barKey="value" 
          layout="vertical" 
          barColor="hsl(var(--positive))"
          isCurrency
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