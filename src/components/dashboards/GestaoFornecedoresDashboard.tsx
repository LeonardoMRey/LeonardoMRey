import { useMemo } from "react";
import { DemandaConsolidada } from "@/types/data";
import { KpiCard } from "../dashboard/KpiCard";
import { BarChart } from "../charts/BarChart";
import { parseDateString } from "@/utils/data-processing";
import { Handshake } from "lucide-react";
import { isBefore, isEqual } from "date-fns";

interface DashboardProps {
  data: DemandaConsolidada[];
}

export const GestaoFornecedoresDashboard = ({ data }: DashboardProps) => {

  const processedMetrics = useMemo(() => {
    const statsPorFornecedor: { 
      [key: string]: { 
        valorTotal: number; 
        pedidos: Set<string>;
        entregasComPrazo: number;
        entregasNoPrazo: number;
      } 
    } = {};

    data.forEach(d => {
      if (!d.supplier) return;

      if (!statsPorFornecedor[d.supplier]) {
        statsPorFornecedor[d.supplier] = {
          valorTotal: 0,
          pedidos: new Set(),
          entregasComPrazo: 0,
          entregasNoPrazo: 0,
        };
      }

      const stats = statsPorFornecedor[d.supplier];
      stats.valorTotal += d.invoiceValue;
      if (d.orderNumber) {
        stats.pedidos.add(d.orderNumber);
      }

      const dataEntrega = parseDateString(d.actualDeliveryDate);
      const dataPrevisao = parseDateString(d.deliveryForecast);

      if (dataEntrega && dataPrevisao) {
        stats.entregasComPrazo++;
        if (isBefore(dataEntrega, dataPrevisao) || isEqual(dataEntrega, dataPrevisao)) {
          stats.entregasNoPrazo++;
        }
      }
    });

    const totalFornecedores = Object.keys(statsPorFornecedor).length;

    const valorPorFornecedorChartData = Object.entries(statsPorFornecedor)
      .map(([name, { valorTotal }]) => ({ name, value: valorTotal }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const pedidosPorFornecedorChartData = Object.entries(statsPorFornecedor)
      .map(([name, { pedidos }]) => ({ name, value: pedidos.size }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
      
    const otdPorFornecedorChartData = Object.entries(statsPorFornecedor)
      .map(([name, { entregasComPrazo, entregasNoPrazo }]) => ({
        name,
        value: entregasComPrazo > 0 ? (entregasNoPrazo / entregasComPrazo) * 100 : 0,
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return {
      totalFornecedores,
      valorPorFornecedorChartData,
      pedidosPorFornecedorChartData,
      otdPorFornecedorChartData,
    };
  }, [data]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-1 md:gap-8 lg:grid-cols-1">
         <KpiCard 
          title="Total de Fornecedores Ativos" 
          value={processedMetrics.totalFornecedores} 
          icon={Handshake} 
          tooltipText="Número de fornecedores únicos com pedidos no período e filtros selecionados."
          delay={0}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2">
        <BarChart 
          title="Top 10 - Valor Comprado por Fornecedor" 
          data={processedMetrics.valorPorFornecedorChartData} 
          dataKeyX="name" 
          dataKeyY="value" 
          barKey="value" 
          layout="horizontal" 
          barColor="hsl(var(--primary))"
          isCurrency
          delay={100}
        />
        <BarChart 
          title="Top 10 - Quantidade de Pedidos por Fornecedor" 
          data={processedMetrics.pedidosPorFornecedorChartData} 
          dataKeyX="name" 
          dataKeyY="value" 
          barKey="value" 
          layout="horizontal" 
          barColor="hsl(var(--primary))"
          delay={200}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:gap-8">
        <BarChart 
            title="Top 10 - Performance de Entrega (OTD) por Fornecedor" 
            data={processedMetrics.otdPorFornecedorChartData} 
            dataKeyX="name" 
            dataKeyY="value" 
            barKey="value" 
            layout="horizontal" 
            barColor="hsl(var(--positive))"
            isPercentage
            delay={300}
          />
      </div>
    </div>
  );
};