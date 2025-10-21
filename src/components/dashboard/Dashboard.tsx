import { useMemo } from "react";
import { DemandaConsolidada } from "@/types/data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { KpiCard } from "./KpiCard";
import { ActionTabs } from "./ActionTabs";
import { FunnelChart } from "../charts/FunnelChart";
import { BarChart } from "../charts/BarChart";
import { StackedBarChart } from "../charts/StackedBarChart";
import { AlertTriangle, Clock, DollarSign, TrendingUp } from "lucide-react";
import { isDateBeforeToday, formatCurrency, formatNumber, calculateLeadTime } from "@/utils/data-processing";

interface DashboardProps {
  data: DemandaConsolidada[];
}

export const Dashboard = ({ data }: DashboardProps) => {

  const processedMetrics = useMemo(() => {
    
    // Usamos Set para garantir a contagem de itens únicos (pedidos/solicitações)
    const uniqueOrders = new Set<string>();
    const uniqueRequests = new Set<string>();
    
    let solicitacoesPendentesCount = 0;
    let totalFaturado = 0;
    let totalLeadTimeDays = 0;
    let leadTimeCount = 0;
    
    const pedidosEmAberto = new Set<string>();
    const pedidosEmAtraso = new Set<string>();
    
    // Agregação para gráficos
    const compradorCarga: { [buyer: string]: { total: number; entregue: number; pendente: number } } = {};
    const fornecedorValor: { [supplier: string]: number } = {};

    data.forEach(d => {
      const isCanceled = d.requestStatus?.toLowerCase().includes('cancelada');
      const isOrderDelivered = d.orderStatus?.toLowerCase().includes('totalmente entregue');
      
      // 1. Contagem de Solicitações Únicas
      if (d.requestNumber) {
        uniqueRequests.add(d.requestNumber);
      }
      
      // 2. Contagem de Pedidos Únicos
      if (d.orderNumber) {
        uniqueOrders.add(d.orderNumber);
      }

      // --- KPIs ---

      // KPI 1: Solicitações Pendentes (Gargalo 1)
      if (!d.orderNumber && !isCanceled && d.requestNumber) {
        solicitacoesPendentesCount++;
      }

      // KPI 2 & 3: Pedidos em Aberto / Atraso
      if (d.orderNumber && !isOrderDelivered) {
        pedidosEmAberto.add(d.orderNumber);
        
        // KPI 3: Pedidos em Atraso (Gargalo 3)
        if (isDateBeforeToday(d.deliveryForecast)) {
          pedidosEmAtraso.add(d.orderNumber);
        }
      }
      
      // KPI 4: Valor Total Faturado (Apenas itens entregues)
      if (isOrderDelivered && d.invoiceValue > 0) {
        totalFaturado += d.invoiceValue;
      }
      
      // KPI 5: Lead Time (Solicitação -> Pedido)
      // Usando requestDate e deliveryForecast como proxy para Lead Time de Atendimento
      if (d.requestDate && d.deliveryForecast && d.orderNumber) {
          const leadTime = calculateLeadTime(d.requestDate, d.deliveryForecast);
          if (leadTime !== null) {
              totalLeadTimeDays += leadTime;
              leadTimeCount++;
          }
      }

      // --- Gráficos ---
      
      // Carga por Comprador
      if (d.buyer) {
        if (!compradorCarga[d.buyer]) {
          compradorCarga[d.buyer] = { total: 0, entregue: 0, pendente: 0 };
        }
        if (d.orderNumber) {
            // Contamos a linha como parte da carga do comprador se houver pedido
            compradorCarga[d.buyer].total++;
            if (isOrderDelivered) {
                compradorCarga[d.buyer].entregue++;
            } else {
                compradorCarga[d.buyer].pendente++;
            }
        }
      }
      
      // Top 10 Fornecedores (Valor da nota)
      if (d.supplier && d.invoiceValue > 0) {
        fornecedorValor[d.supplier] = (fornecedorValor[d.supplier] || 0) + d.invoiceValue;
      }
    });
    
    // Finalização dos KPIs
    const leadTimeMedio = leadTimeCount > 0 ? (totalLeadTimeDays / leadTimeCount).toFixed(1) : 'N/A';
    
    // Preparação dos dados para gráficos
    
    // Carga por Comprador
    const compradorChartData = Object.entries(compradorCarga).map(([name, counts]) => ({
        name,
        'Pedidos Entregues': counts.entregue,
        'Pedidos Pendentes': counts.pendente,
        Total: counts.total,
    })).sort((a, b) => b.Total - a.Total);

    // Top 10 Fornecedores
    const fornecedorChartData = Object.entries(fornecedorValor)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
        
    // Funil de Compras
    const funnelData = [
        { name: '1. Total de Solicitações', value: uniqueRequests.size },
        { name: '2. Total de Pedidos Emitidos', value: uniqueOrders.size },
        { name: '3. Pedidos Totalmente Entregues', value: data.filter(d => d.orderStatus?.toLowerCase().includes('totalmente entregue')).length },
    ].sort((a, b) => b.value - a.value);

    return {
      solicitacoesPendentesCount,
      pedidosEmAbertoCount: pedidosEmAberto.size,
      pedidosEmAtrasoCount: pedidosEmAtraso.size,
      totalFaturado,
      leadTimeMedio,
      compradorChartData,
      fornecedorChartData,
      funnelData,
    };
  }, [data]);

  return (
    <ScrollArea className="h-[85vh] pr-4">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-foreground">Painel de Gestão de Compras</h1>
        <Separator />

        {/* A. Indicadores Principais (KPIs) */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <KpiCard 
            title="Solicitações Pendentes (Gargalo 1)" 
            value={formatNumber(processedMetrics.solicitacoesPendentesCount)} 
            icon={AlertTriangle} 
            iconColorClass="text-yellow-500"
            description="Aguardando emissão de pedido."
          />
          <KpiCard 
            title="Pedidos em Aberto (Gargalo 2)" 
            value={formatNumber(processedMetrics.pedidosEmAbertoCount)} 
            icon={Clock} 
            iconColorClass="text-primary"
            description="Aguardando entrega total."
          />
          <KpiCard 
            title="Pedidos em Atraso (Gargalo 3)" 
            value={formatNumber(processedMetrics.pedidosEmAtrasoCount)} 
            icon={AlertTriangle} 
            iconColorClass="text-red-500"
            description="Previsão de entrega ultrapassada."
          />
          <KpiCard 
            title="Valor Total Faturado (Entregue)" 
            value={formatCurrency(processedMetrics.totalFaturado)} 
            icon={DollarSign} 
            iconColorClass="text-green-500"
            description="Soma dos valores de notas entregues."
          />
          <KpiCard 
            title="Lead Time Médio (Solicitação -> Entrega Prevista)" 
            value={`${processedMetrics.leadTimeMedio} dias`} 
            icon={TrendingUp} 
            iconColorClass="text-accent"
            description="Média de dias para atendimento."
          />
        </div>
        
        <Separator />

        {/* B. Gráficos Visuais */}
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Funil de Compras */}
            <div className="lg:col-span-1">
                <FunnelChart data={processedMetrics.funnelData} />
            </div>
            
            {/* Top 10 Fornecedores */}
            <div className="lg:col-span-2">
                <BarChart 
                    title="Top 10 Fornecedores (Valor da Nota)"
                    data={processedMetrics.fornecedorChartData}
                    dataKeyX="value"
                    dataKeyY="name"
                    barKey="value"
                    layout="vertical"
                    height={300}
                    barColor="hsl(var(--accent))"
                    isCurrency={true}
                />
            </div>
        </div>
        
        {/* Carga por Comprador (Stacked Bar Chart) */}
        <StackedBarChart data={processedMetrics.compradorChartData} />
        
        <Separator />

        {/* C. Tabelas de Ação */}
        <ActionTabs data={data} />
        
      </div>
    </ScrollArea>
  );
};