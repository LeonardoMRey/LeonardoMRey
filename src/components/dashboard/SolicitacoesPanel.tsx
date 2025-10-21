import { useMemo } from 'react';
import { Demanda } from '@/types/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from './KpiCard';
import { Package, CheckCircle, ShoppingCart, Clock, AlertTriangle, Timer } from 'lucide-react';
import { parse, differenceInDays, startOfToday, isValid } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SolicitacoesPanelProps {
  solicitacoesData: Demanda[];
}

export const SolicitacoesPanel: React.FC<SolicitacoesPanelProps> = ({ solicitacoesData }) => {
  
  const metrics = useMemo(() => {
    // Filtra demandas que são solicitações (têm requestNumber) e que foram autorizadas
    const validSolicitacoes = solicitacoesData.filter(s => 
      !!s.requestNumber && s.authorization?.toLowerCase() !== 'não'
    );
    
    const total = validSolicitacoes.length;
    const today = startOfToday();
    
    let totalAprovadas = 0;
    let totalRejeitadas = 0;
    let totalConvertidas = 0;
    let totalDaysToApprove = 0;
    let approvedCount = 0;
    
    const solicitacoesPendentesAtrasadas: Demanda[] = [];
    const solicitacoesVinculadas: Demanda[] = [];

    validSolicitacoes.forEach(s => {
      const statusLower = s.requestStatus?.toLowerCase() || '';
      
      // Lógica de Status
      if (statusLower.includes('totalmente atendida') || statusLower.includes('parcialmente atendida')) {
        // Consideramos 'Aprovada' se foi atendida (total ou parcial)
        totalAprovadas++;
        
        // Cálculo de tempo médio de atendimento (usando requestDate e deliveryDate/data prevista)
        try {
          const requestDate = parse(s.requestDate, 'dd/MM/yyyy', new Date());
          const deliveryDate = parse(s.deliveryDate || '', 'dd/MM/yyyy', new Date()); // Usa deliveryDate como proxy de atendimento
          
          // Só calcula se ambas as datas forem válidas e a entrega/previsão for posterior à solicitação
          if (isValid(requestDate) && isValid(deliveryDate) && deliveryDate >= requestDate) {
            totalDaysToApprove += differenceInDays(deliveryDate, requestDate);
            approvedCount++;
          }
        } catch {}
      } else if (statusLower.includes('rejeitada') || statusLower.includes('cancelada')) {
        totalRejeitadas++;
      } else {
        // Se não foi atendida nem rejeitada, consideramos aberta/pendente
        totalAbertas++;
      }
      
      if (s.orderNumber) {
        totalConvertidas++;
        solicitacoesVinculadas.push(s);
      }

      // Destaque: Solicitações ABERTAS (Solicitado, Em Análise, Pendente) com mais de 5 dias
      if (statusLower === 'solicitado' || statusLower === 'em análise' || statusLower.includes('pendente')) {
        try {
          const requestDate = parse(s.requestDate, 'dd/MM/yyyy', new Date());
          if (isValid(requestDate) && differenceInDays(today, requestDate) > 5) {
            solicitacoesPendentesAtrasadas.push(s);
          }
        } catch {}
      }
    });
    
    const tempoMedioAprovacao = approvedCount > 0 ? (totalDaysToApprove / approvedCount).toFixed(1) : 'N/A';

    return {
      total,
      totalAbertas: Math.max(0, totalAbertas),
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
          title="Total de Solicitações (Autorizadas)" 
          value={metrics.total} 
          icon={Package} 
          iconColorClass="text-primary"
        />
        <KpiCard 
          title="Solicitações Abertas/Pendentes" 
          value={metrics.totalAbertas} 
          icon={Clock} 
          iconColorClass="text-yellow-500"
        />
        <KpiCard 
          title="Solicitações Atendidas (Total/Parcial)" 
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
          title="Tempo Médio Atendimento (dias)" 
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
                      <Badge variant="destructive" className="ml-2">{s.requestStatus}</Badge>
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
                      <Badge className="bg-primary hover:bg-primary/80 ml-2">Pedido: {s.orderNumber}</Badge>
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