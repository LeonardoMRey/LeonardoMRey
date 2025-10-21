import { DemandaConsolidada } from '@/types/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMemo } from 'react';
import { isDateBeforeToday, formatNumber, formatCurrency } from '@/utils/data-processing';
import { cn } from '@/lib/utils';

interface ActionTabsProps {
    data: DemandaConsolidada[];
}

const TableSolicitacoesPendentes: React.FC<{ data: DemandaConsolidada[] }> = ({ data }) => {
    const filteredData = useMemo(() => {
        // Linhas onde N° do Pedido está VAZIO e Situação da solicitação não é 'Cancelada'.
        return data.filter(d => 
            !d.orderNumber && !d.requestStatus?.toLowerCase().includes('cancelada')
        );
    }, [data]);

    return (
        <ScrollArea className="h-[400px] w-full border rounded-lg">
            <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                        <TableHead>Nº Solicitação</TableHead>
                        <TableHead>Data Solicitação</TableHead>
                        <TableHead>Solicitante</TableHead>
                        <TableHead>Descrição do Insumo</TableHead>
                        <TableHead className="text-right">Qtd. Solicitada</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                🎉 Nenhuma solicitação pendente de compra encontrada!
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredData.map((d, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{d.requestNumber}</TableCell>
                                <TableCell>{d.requestDate}</TableCell>
                                <TableCell>{d.buyer}</TableCell> {/* Usando buyer como Solicitante */}
                                <TableCell>{d.itemDescription}</TableCell>
                                <TableCell className="text-right">{formatNumber(d.requestedQuantity)}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </ScrollArea>
    );
};

const TableFollowUpFornecedores: React.FC<{ data: DemandaConsolidada[] }> = ({ data }) => {
    const filteredData = useMemo(() => {
        // Linhas onde N° do Pedido NÃO é NULO e Situação do pedido NÃO é 'Totalmente entregue'.
        return data.filter(d => 
            !!d.orderNumber && !d.orderStatus?.toLowerCase().includes('totalmente entregue')
        );
    }, [data]);

    return (
        <ScrollArea className="h-[400px] w-full border rounded-lg">
            <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                        <TableHead>N° Pedido</TableHead>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead>Comprador</TableHead>
                        <TableHead>Previsão de Entrega</TableHead>
                        <TableHead>Situação do Pedido</TableHead>
                        <TableHead className="text-right">Saldo Pendente</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                Todos os pedidos em aberto estão totalmente entregues.
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredData.map((d, index) => {
                            const isAtrasado = isDateBeforeToday(d.deliveryForecast);
                            return (
                                <TableRow 
                                    key={index} 
                                    className={cn(isAtrasado && 'bg-red-900/30 hover:bg-red-900/50 transition-colors')}
                                >
                                    <TableCell className="font-medium">{d.orderNumber}</TableCell>
                                    <TableCell>{d.supplier}</TableCell>
                                    <TableCell>{d.buyer}</TableCell>
                                    <TableCell className={cn(isAtrasado && 'text-red-400 font-semibold')}>
                                        {d.deliveryForecast}
                                    </TableCell>
                                    <TableCell>{d.orderStatus}</TableCell>
                                    <TableCell className="text-right">{formatNumber(d.pendingQuantity)}</TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </ScrollArea>
    );
};

const TableRelatorioGeral: React.FC<{ data: DemandaConsolidada[] }> = ({ data }) => {
    
    return (
        <ScrollArea className="h-[400px] w-full border rounded-lg">
            <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                        <TableHead>Solicitação</TableHead>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Comprador</TableHead>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead>Status Pedido</TableHead>
                        <TableHead className="text-right">Valor Nota</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((d, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{d.requestNumber || '-'}</TableCell>
                            <TableCell>{d.orderNumber || '-'}</TableCell>
                            <TableCell>{d.buyer}</TableCell>
                            <TableCell>{d.supplier || '-'}</TableCell>
                            <TableCell>{d.orderStatus || '-'}</TableCell>
                            <TableCell className="text-right">{formatCurrency(d.invoiceValue)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </ScrollArea>
    );
};


export const ActionTabs: React.FC<ActionTabsProps> = ({ data }) => {
    return (
        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Tabelas de Ação</h2>
            <Tabs defaultValue="pendencias">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pendencias">PENDÊNCIAS DE COMPRA (Gargalo 1)</TabsTrigger>
                    <TabsTrigger value="followup">FOLLOW-UP DE FORNECEDORES (Gargalos 2 e 3)</TabsTrigger>
                    <TabsTrigger value="geral">Relatório Geral</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pendencias" className="mt-4">
                    <TableSolicitacoesPendentes data={data} />
                </TabsContent>
                
                <TabsContent value="followup" className="mt-4">
                    <TableFollowUpFornecedores data={data} />
                </TabsContent>
                
                <TabsContent value="geral" className="mt-4">
                    <TableRelatorioGeral data={data} />
                </TabsContent>
            </Tabs>
        </section>
    );
};