import { useMemo } from "react";
import { DemandaConsolidada } from "@/types/data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { KpiCard } from "./KpiCard";
import { ActionTabs } from "./ActionTabs";
import { BarChart } from "../charts/BarChart";
import { AlertTriangle, CheckCircle, Clock, Percent, Target, TrendingUp } from "lucide-react";
import { calculateLeadTime, formatCurrency, formatNumber, parseDateString } from "@/utils/data-processing";
import { isBefore, isValid } from "date-fns";

interface DashboardProps {
  data: DemandaConsolidada[];
}

export const Dashboard = ({ data }: DashboardProps) => {

  const processedMetrics = useMemo(() => {
    let leadTimeTotalDays = 0;
    let leadTimeTotalCount = 0;
    let leadTimeInternoDays = 0;
    let leadTimeInternoCount = 0;
    let leadTimeExternoDays = 0;
    let leadTimeExternoCount = 0;
    
    let entregasNoPrazo = 0;
    let totalEntregasConsideradas = 0;
    
    const pedidos = data.filter(d => d.orderNumber);
    const uniquePedidos = [...new Set(pedidos.map(p => p.orderNumber))];
    const totalPedidosUnicos = uniquePedidos.length;
    
    let pedidosTotalmenteEntregues = 0;
    
    const spendPorObra: { [key: string]: number } = {};
    const atrasosPorFornecedor: { [key: string]: number } = {};

    data.forEach(d => {
      const requestDate = parseDateString(d.requestDate);
      const orderDate = parseDateString(d.orderDate); // Assumindo que 'orderDate' pode existir
      const deliveryDate = parseDateString(d.deliveryForecast); // Usando previsão como data de entrega

      // Lead Times
      if (requestDate && deliveryDate) {
        const leadTimeTotal = calculateLeadTime(d.requestDate, d.deliveryForecast);
        if (leadTimeTotal !== null) {
          leadTimeTotalDays += leadTimeTotal;
          leadTimeTotalCount++;
        }
      }
      if (requestDate && orderDate) {
        const leadTimeInterno = calculateLeadTime(d.requestDate, d.orderDate);
        if (leadTimeInterno !== null) {
          leadTimeInternoDays += leadTimeInterno;
          leadTimeInternoCount++;
        }
      }
      if (orderDate && deliveryDate) {
        const leadTimeExterno = calculateLeadTime(d.orderDate, d.deliveryForecast);
        if (leadTimeExterno !== null) {
          leadTimeExternoDays += leadTimeExterno;
          leadTimeExternoCount++;
        }
      }

      // OTD (On-Time Delivery)
      const previsaoEntrega = parseDateString(d.deliveryForecast);
      if (deliveryDate && previsaoEntrega && isValid(deliveryDate) && isValid(previsaoEntrega)) {
        totalEntregasConsideradas++;
        if (!isBefore(previsaoEntrega, deliveryDate)) { // entrega <= previsão
          entregasNoPrazo++;
        }
      }
      
      // Spend por Obra
      if (d.project && d.invoiceValue > 0) {
        spendPorObra[d.project] = (spendPorObra[d.project] || 0) + d.invoiceValue;
      }
      
      // Atrasos por Fornecedor
      if (d.supplier && deliveryDate && previsaoEntrega && isBefore(previsaoEntrega, deliveryDate)) {
        atrasosPorFornecedor[d.supplier] = (atrasosPorFornecedor[d.supplier] || 0) + 1;
      }
    });
    
    // Fill Rate (Taxa de Atendimento)
    const pedidosEntreguesSet = new Set(
      pedidos
        .filter(p => p.orderStatus?.toLowerCase().includes('totalmente entregue'))
        .map(p => p.orderNumber)
    );
    pedidosTotalmenteEntregues = pedidosEntreguesSet.size;

    const leadTimeTotalMedio = leadTimeTotalCount > 0 ? (leadTimeTotalDays / leadTimeTotalCount).toFixed(1) : 'N/A';
    const leadTimeInternoMedio = leadTimeInternoCount > 0 ? (leadTimeInternoDays / leadTimeInternoCount).toFixed(1) : 'N/A';
    const leadTimeExternoMedio = leadTimeExternoCount > 0 ? (leadTimeExternoDays / leadTimeExternoCount).toFixed(1) : 'N/A';
    
    const otdRate = totalEntregasConsideradas > 0 ? ((entregasNoPrazo / totalEntregasConsideradas) * 100).toFixed(1) : 'N/A';
    const fillRate = totalPedidosUnicos > 0 ? ((pedidosTotalmenteEntregues / totalPedidosUnicos) * 100).toFixed(1) : 'N/A';

    const spendPorObraChartData = Object.entries(spendPorObra)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
      
    const atrasosPorFornecedorChartData = Object.entries(atrasosPorFornecedor)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10

    return {
      leadTimeTotalMedio,
      leadTimeInternoMedio,
      leadTimeExternoMedio,
      otdRate,
      fillRate,
      spendPorObraChartData,
      atrasosPorFornecedorChartData,
    };
  }, [data]);

  return (
    <ScrollArea className="h-[85vh] pr-4">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-foreground">Painel de Performance de Compras</h1>
        <Separator />

        {/* A. Indicadores de Performance (KPIs) */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <KpiCard 
            title="Lead Time Total Médio" 
            value={`${processedMetrics.leadTimeTotalMedio} dias`} 
            icon={TrendingUp} 
            iconColorClass="text-primary"
            description="Ciclo completo: Solicitação -> Entrega."
          />
          <KpiCard 
            title="Lead Time Interno Médio" 
            value={`${processedMetrics.leadTimeInternoMedio} dias`} 
            icon={Clock} 
            iconColorClass="text-accent"
            description="Eficiência da equipe: Solicitação -> Pedido."
          />
          <KpiCard 
            title="Lead Time Externo Médio" 
            value={`${processedMetrics.leadTimeExternoMedio} dias`} 
            icon={Clock} 
            iconColorClass="text-yellow-500"
            description="Eficiência do fornecedor: Pedido -> Entrega."
          />
          <KpiCard 
            title="Entrega no Prazo (OTD)" 
            value={`${processedMetrics.otdRate}%`} 
            icon={Target} 
            iconColorClass="text-green-500"
            description="Pedidos entregues até a data prevista."
          />
          <KpiCard 
            title="Taxa de Atendimento (Fill Rate)" 
            value={`${processedMetrics.fillRate}%`} 
            icon={CheckCircle} 
            iconColorClass="text-green-500"
            description="% de pedidos 'Totalmente Entregue'."
          />
        </div>
        
        <Separator />

        {/* B. Gráficos de Análise Gerencial */}
        <div className="grid gap-6 lg:grid-cols-2">
            <BarChart 
                title="Spend por Obra"
                data={processedMetrics.spendPorObraChartData}
                dataKeyX="name"
                dataKeyY="value"
                barKey="value"
                layout="horizontal"
                height={350}
                barColor="hsl(var(--primary))"
                isCurrency={true}
            />
            <BarChart 
                title="Top 10 Fornecedores com Atraso"
                data={processedMetrics.atrasosPorFornecedorChartData}
                dataKeyX="value"
                dataKeyY="name"
                barKey="value"
                layout="vertical"
                height={350}
                barColor="hsl(var(--destructive))"
            />
        </div>
        
        <Separator />

        {/* C. Tabelas de Ação (Gargalos) */}
        <ActionTabs data={data} />
        
      </div>
    </ScrollArea>
  );
};