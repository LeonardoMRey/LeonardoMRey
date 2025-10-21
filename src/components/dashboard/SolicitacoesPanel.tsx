import { useMemo } from 'react';
import { SolicitacaoProcessada } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from './KpiCard';
import { Package, CheckCircle, XCircle, ShoppingCart, Clock, AlertTriangle, Timer } from 'lucide-react';
import { parse, differenceInDays, isBefore, startOfToday } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SolicitacoesPanelProps {
  solicitacoesData: SolicitacaoProcessada[];
}

export const SolicitacoesPanel: React.FC<SolicitacoesPanelProps> = ({ solicitacoesData }) => {
  
  const metrics = useMemo(() => {
    const total = solicitacoesData.length;
    const today = startOfToday();
    
    let totalAprovadas = 0;
    let totalRejeitadas = 0;
    let totalConvertidas = 0;
    let totalAbertas = 0;
    let totalDaysToApprove = 0;
    let approvedCount = 0;
    
    const solicitacoesPendentesAtrasadas: SolicitacaoProcessada[] = [];
    const solicitacoesVinculadas: SolicitacaoProcessada[] = [];

    solicitacoesData.forEach(s => {
      const statusLower = s.status?.toLowerCase() || '';
      
      if (statusLower.includes('aprovada')) {
        totalAprovadas++;
        // Cálculo de tempo médio de aprovação (assumindo que 'deliveryDate' é a data de aprovação se 'status' for aprovado)
        try {
          const requestDate = parse(s.requestDate, 'dd/MM/yyyy', new Date());
          const approvalDate = parse(s.deliveryDate, 'dd/MM/yyyy', new Date());
          if (approvalDate > requestDate) {
            totalDaysToApprove += differenceInDays(approvalDate, requestDate);
            approvedCount++;
          }
        } catch {}
      } else if (statusLower.includes('rejeitada') || statusLower.includes('cancelada')) {
        totalRejeitadas++;
      } else {
        totalAbertas++;
      }

      if (s.isLinked) {
        totalConvertidas++;
        solicitacoesVinculadas.push(s);
      }

      // Destaque: Solicitações com mais de 5 dias sem andamento (usamos a data de solicitação como referência)
      if (statusLower === 'solicitado' || statusLower === 'em análise') {
        try {
          const requestDate = parse(s.requestDate, 'dd/MM/yyyy', new Date());
          if (differenceInDays(today, requestDate) > 5) {
            solicitacoesPendentesAtrasadas.push(s);
          }
        } catch {}
      }
    });

    const tempoMedioAprovacao = approvedCount > 0 ? (totalDaysToApprove / approvedCount).toFixed(1) : 'N/A';

    return {
      total,
      totalAbertas,
      totalAprovadas,
      totalRejeitadas,
      totalConvertidas,
      tempoMedioAprovacao,
      solicitacoesPendentesAtrasadas,
      solicitacoesVinculadas,
    };
  }, [solicitacoesData]);

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">🟩 Painel de Solicitações (Requisições Internas)</h2>
      
      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <KpiCard 
          title="Total de Solicitações" 
          value={metrics.total} 
          icon={Package} 
          iconColorClass="text-primary"
        />
        <KpiCard 
          title="Solicitações Abertas" 
          value={metrics.totalAbertas} 
          icon={Clock} 
          iconColorClass="text-yellow-500"
        />
        <KpiCard 
          title="Solicitações Aprovadas" 
          value={metrics.totalAprovadas} 
          icon={CheckCircle} 
          iconColorClass="text-green-500"
        />
        <KpiCard 
          title="Convertidas em Pedido" 
          value={metrics.totalConvertidas} 
          icon={ShoppingCart} 
          iconColorClass="text-accent"
        />
        <KpiCard 
          title="Tempo Médio Aprovação (dias)" 
          value={metrics.tempoMedioAprovacao} 
          icon={Timer} 
          iconColorClass="text-muted-foreground"
        />
      </div>

      {/* Destaques */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-yellow-500">
              <AlertTriangle className="w-5 h-5 mr-2" /> Solicitações Paradas (> 5 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[150px]">
              {metrics.solicitacoesPendentesAtrasadas.length > 0 ? (
                <ul className="space-y-2">
                  {metrics.solicitacoesPendentesAtrasadas.map(s => (
                    <li key={s.requestNumber} className="text-sm flex justify-between items-center p-2 bg-card/50 rounded">
                      <span className="font-medium text-foreground">{s.requestNumber} - {s.itemDescription}</span>
                      <Badge variant="destructive" className="ml-2">{s.status}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Nenhuma solicitação parada encontrada.</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-accent">
              <ShoppingCart className="w-5 h-5 mr-2" /> Solicitações Vinculadas a Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[150px]">
              {metrics.solicitacoesVinculadas.length > 0 ? (
                <ul className="space-y-2">
                  {metrics.solicitacoesVinculadas.map(s => (
                    <li key={s.requestNumber} className="text-sm flex justify-between items-center p-2 bg-card/50 rounded">
                      <span className="font-medium text-foreground">{s.requestNumber}</span>
                      <Badge className="bg-primary hover:bg-primary/80 ml-2">Pedido: {s.linkedOrderNumber}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Nenhuma solicitação vinculada a pedido.</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      <Separator />
    </section>
  );
};