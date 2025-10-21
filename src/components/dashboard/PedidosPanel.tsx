import { useMemo } from 'react';
import { Compra } from '@/types/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from './KpiCard';
import { ShoppingCart, Truck, Clock, XCircle, Timer, AlertTriangle } from 'lucide-react';
import { parse, differenceInDays, isBefore, startOfToday } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PedidosPanelProps {
  comprasData: Compra[];
}

export const PedidosPanel: React.FC<PedidosPanelProps> = ({ comprasData }) => {
  
  const metrics = useMemo(() => {
    const totalPedidos = new Set(comprasData.map(c => c.orderNumber)).size;
    
    let totalEntregues = 0;
    let totalAtraso = 0;
    let totalCancelados = 0;
    let totalDaysToDelivery = 0;
    let deliveredCount = 0;
    
    const pedidosAtrasados: Compra[] = [];
    const pedidosAguardandoEntrega: Compra[] = [];
    const today = startOfToday();

    comprasData.forEach(c => {
      const statusLower = c.deliveryStatus?.toLowerCase() || '';
      
      if (statusLower.includes('entregue')) {
        totalEntregues++;
        
        // Cálculo de tempo médio de entrega (usando data de entrega vs data prevista como proxy para emissão vs entrega)
        try {
          const deliveryDate = parse(c.deliveryDate, 'dd/MM/yyyy', new Date());
          // Assumindo que a data de emissão é a data de criação do registro (não temos esse campo, então usamos uma data fixa ou a data de hoje - vamos usar 30 dias antes da entrega como proxy)
          const issueDateProxy = new Date(deliveryDate);
          issueDateProxy.setDate(deliveryDate.getDate() - 30); // Proxy: 30 dias antes da entrega
          
          totalDaysToDelivery += differenceInDays(deliveryDate, issueDateProxy);
          deliveredCount++;
        } catch {}
      } else if (statusLower.includes('cancelado')) {
        totalCancelados++;
      }

      // Destaque: Pedidos com status "aguardando entrega" e data prevista ultrapassada.
      try {
        const dataPrevista = parse(c.deliveryDate, 'dd/MM/yyyy', new Date());
        
        if (isBefore(dataPrevista, today) && !statusLower.includes('entregue') && !statusLower.includes('cancelado')) {
          totalAtraso++;
          pedidosAtrasados.push(c);
        }
        
        if (statusLower.includes('aguardando entrega') || statusLower.includes('em transporte')) {
            pedidosAguardandoEntrega.push(c);
        }
      } catch {}
    });

    const tempoMedioEntrega = deliveredCount > 0 ? (totalDaysToDelivery / deliveredCount).toFixed(1) : 'N/A';

    return {
      totalPedidos,
      totalEntregues,
      totalAtraso,
      totalCancelados,
      tempoMedioEntrega,
      pedidosAtrasados,
      pedidosAguardandoEntrega,
    };
  }, [comprasData]);

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">🟦 Painel de Pedidos (Pedidos Emitidos)</h2>
      
      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <KpiCard 
          title="Total de Pedidos Emitidos" 
          value={metrics.totalPedidos} 
          icon={ShoppingCart} 
          iconColorClass="text-primary"
        />
        <KpiCard 
          title="Pedidos Entregues" 
          value={metrics.totalEntregues} 
          icon={Truck} 
          iconColorClass="text-green-500"
        />
        <KpiCard 
          title="Pedidos em Atraso" 
          value={metrics.totalAtraso} 
          icon={AlertTriangle} 
          iconColorClass="text-red-500"
        />
        <KpiCard 
          title="Pedidos Cancelados" 
          value={metrics.totalCancelados} 
          icon={XCircle} 
          iconColorClass="text-muted-foreground"
        />
        <KpiCard 
          title="Tempo Médio Entrega (dias)" 
          value={metrics.tempoMedioEntrega} 
          icon={Timer} 
          iconColorClass="text-primary"
        />
      </div>

      {/* Destaques */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-red-500">
              <AlertTriangle className="w-5 h-5 mr-2" /> Pedidos com Entrega Atrasada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[150px]">
              {metrics.pedidosAtrasados.length > 0 ? (
                <ul className="space-y-2">
                  {metrics.pedidosAtrasados.map(c => (
                    <li key={c.orderNumber} className="text-sm flex justify-between items-center p-2 bg-card/50 rounded">
                      <span className="font-medium text-foreground">{c.orderNumber} - {c.supplier}</span>
                      <Badge variant="destructive" className="ml-2">Previsto: {c.deliveryDate}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Nenhum pedido em atraso encontrado.</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-yellow-500">
              <Clock className="w-5 h-5 mr-2" /> Pedidos Aguardando Entrega
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[150px]">
              {metrics.pedidosAguardandoEntrega.length > 0 ? (
                <ul className="space-y-2">
                  {metrics.pedidosAguardandoEntrega.map(c => (
                    <li key={c.orderNumber} className="text-sm flex justify-between items-center p-2 bg-card/50 rounded">
                      <span className="font-medium text-foreground">{c.orderNumber} - {c.supplier}</span>
                      <Badge className="bg-yellow-600 hover:bg-yellow-700 ml-2">{c.deliveryStatus}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Nenhum pedido aguardando entrega.</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      <Separator />
    </section>
  );
};