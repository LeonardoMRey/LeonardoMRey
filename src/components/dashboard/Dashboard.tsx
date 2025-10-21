import { useMemo } from "react";
import { Solicitacao, Compra } from "@/types/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Package, ShoppingCart, Timer, DollarSign, AlertTriangle, FileText } from "lucide-react";
import { parse, isBefore, startOfToday } from 'date-fns';
import { SolicitacaoStatusChart } from "../charts/SolicitacaoStatusChart";
import { SupplierPieChart } from "../charts/SupplierPieChart";
import { TimelineLineChart } from "../charts/TimelineLineChart";
import { BuyerStackedBarChart } from "../charts/BuyerStackedBarChart";
import { SolicitacaoTable } from "./SolicitacaoTable";
import { ExportMenu } from "./ExportMenu";

interface DashboardProps {
  solicitacoesData: Solicitacao[];
  comprasData: Compra[];
  onReset: () => void;
}

export const Dashboard = ({ solicitacoesData, comprasData, onReset }: DashboardProps) => {

  const kpis = useMemo(() => {
    const totalSolicitacoes = solicitacoesData.length;
    const totalPedidos = new Set(comprasData.map(p => p.orderNumber)).size;
    
    // Solicitações pendentes de atendimento (Status diferente de 'Totalmente atendida')
    const solicitacoesPendentes = solicitacoesData.filter(s => 
      s.status && !s.status.toLowerCase().includes('atendida')
    ).length;
    
    const valorTotalPedidos = comprasData.reduce((acc, curr) => acc + curr.netValue, 0);
    
    const today = startOfToday();
    const pedidosAtrasados = comprasData.filter(c => {
      try {
        const dataPrevista = parse(c.deliveryDate, 'dd/MM/yyyy', new Date());
        // Pedido está atrasado se a data prevista for anterior a hoje E o status não for 'Totalmente entregue'
        return isBefore(dataPrevista, today) && c.deliveryStatus !== 'Totalmente entregue';
      } catch {
        return false;
      }
    }).length;

    return {
      totalSolicitacoes,
      totalPedidos,
      solicitacoesPendentes,
      valorTotalPedidos,
      pedidosAtrasados,
    };
  }, [solicitacoesData, comprasData]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <FileText className="h-4 w-4 text-accent" />
          <span>Dados carregados com sucesso.</span>
        </div>
        <div className="flex gap-4">
          <ExportMenu solicitacoesData={solicitacoesData} comprasData={comprasData} />
          <Button onClick={onReset} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Carregar Novos Arquivos
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Solicitações</CardTitle>
            <Package className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis.totalSolicitacoes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingCart className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis.totalPedidos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitações Pendentes</CardTitle>
            <Timer className="h-5 w-5 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis.solicitacoesPendentes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total em Pedidos</CardTitle>
            <DollarSign className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {kpis.valorTotalPedidos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos com Atraso</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis.pedidosAtrasados}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Linha do Tempo e Barras/Pizza */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-3">
          <TimelineLineChart data={solicitacoesData} />
        </div>
        <SolicitacaoStatusChart data={solicitacoesData} />
        <SupplierPieChart data={comprasData} />
        <BuyerStackedBarChart data={comprasData} />
      </div>

      {/* Tabela Dinâmica */}
      <SolicitacaoTable solicitacoesData={solicitacoesData} comprasData={comprasData} />
    </div>
  );
};