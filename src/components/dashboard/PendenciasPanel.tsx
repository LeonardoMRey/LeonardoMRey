import { useMemo } from 'react';
import { Demanda } from '@/types/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { FunnelChart } from '../charts/FunnelChart';
import { Link, AlertTriangle, DollarSign } from 'lucide-react';
import { KpiCard } from './KpiCard';

interface PendenciasPanelProps {
  solicitacoesData: Demanda[];
  comprasData: Demanda[];
  comprasSemSolicitacao: Demanda[];
}

export const PendenciasPanel: React.FC<PendenciasPanelProps> = ({ solicitacoesData, comprasData, comprasSemSolicitacao }) => {
  
  const metrics = useMemo(() => {
    // Filtra solicitações que não foram autorizadas (Autorização = 'Não')
    const authorizedSolicitacoes = solicitacoesData.filter(s => s.authorization?.toLowerCase() !== 'não');

    const solicitacoesSemPedido = authorizedSolicitacoes.filter(s => !s.orderNumber);
    const totalSolicitacoes = authorizedSolicitacoes.length;
    const totalConvertidas = authorizedSolicitacoes.filter(s => !!s.orderNumber).length;
    
    const conversaoRate = totalSolicitacoes > 0 
      ? ((totalConvertidas / totalSolicitacoes) * 100).toFixed(1) 
      : '0.0';

    // Funil: Solicitado -> Aprovado -> Pedido Emitido -> Entregue
    const funnelData = [
      { name: '1. Solicitado', value: totalSolicitacoes },
      { name: '2. Aprovado', value: authorizedSolicitacoes.filter(s => s.requestStatus?.toLowerCase().includes('aprovada') || s.requestStatus?.toLowerCase().includes('atendida')).length },
      { name: '3. Pedido Emitido', value: totalConvertidas },
      { name: '4. Entregue', value: comprasData.filter(c => c.deliveryStatus?.toLowerCase().includes('entregue')).length },
    ].sort((a, b) => b.value - a.value); // Ordena para simular o funil no BarChart

    return {
      solicitacoesSemPedido,
      conversaoRate,
      funnelData,
    };
  }, [solicitacoesData, comprasData]);

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">🟨 Painel de Pendências e Conexões</h2>
      
      {/* KPIs de Conexão */}
      <div className="grid gap-6 lg:grid-cols-3">
        <KpiCard 
          title="Taxa de Conversão (Solicitação -> Pedido)" 
          value={`${metrics.conversaoRate}%`} 
          icon={Link} 
          iconColorClass="text-green-400"
        />
        <KpiCard 
          title="Solicitações Pendentes de Compra" 
          value={metrics.solicitacoesSemPedido.length} 
          icon={AlertTriangle} 
          iconColorClass="text-red-500"
        />
        <KpiCard 
          title="Pedidos de Emissão Direta" 
          value={comprasSemSolicitacao.length} 
          icon={DollarSign} 
          iconColorClass="text-yellow-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* Gráfico de Funil */}
        <div className="xl:col-span-2">
          <FunnelChart data={metrics.funnelData} />
        </div>

        {/* Pedidos sem Solicitação de Origem */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-yellow-500">
              <AlertTriangle className="w-5 h-5 mr-2" /> Pedidos Sem Solicitação (Emissão Direta)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              {comprasSemSolicitacao.length > 0 ? (
                <ul className="space-y-2">
                  {comprasSemSolicitacao.map(c => (
                    <li key={c.orderNumber} className="text-sm flex justify-between items-center p-2 bg-card/50 rounded">
                      <span className="font-medium text-foreground">{c.orderNumber}</span>
                      <Badge className="bg-yellow-700 hover:bg-yellow-800 ml-2">{c.supplier}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Todos os pedidos possuem solicitação de origem.</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Solicitações Sem Pedido */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center text-red-500">
            <AlertTriangle className="w-5 h-5 mr-2" /> Solicitações Pendentes de Compra
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            {metrics.solicitacoesSemPedido.length > 0 ? (
              <ul className="space-y-2">
                {metrics.solicitacoesSemPedido.map(s => (
                  <li key={s.requestNumber} className="text-sm flex justify-between items-center p-2 bg-card/50 rounded">
                    <span className="font-medium text-foreground">{s.requestNumber} - {s.itemDescription}</span>
                    <Badge variant="secondary" className="ml-2">{s.requestStatus}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Todas as solicitações foram atendidas ou estão em andamento.</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      <Separator />
    </section>
  );
};