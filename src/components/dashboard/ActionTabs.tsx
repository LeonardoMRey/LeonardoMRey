import { DemandaConsolidada } from '@/types/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMemo } from 'react';
import { isDateBeforeToday, formatNumber } from '@/utils/data-processing';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ActionTabsProps {
    data: DemandaConsolidada[];
}

const TableGargaloInterno: React.FC<{ data: DemandaConsolidada[] }> = ({ data }) => {
    const filteredData = useMemo(() => {
        return data.filter(d => !d.orderNumber && !d.requestStatus?.toLowerCase().includes('cancelada'));
    }, [data]);

    return (
        <ScrollArea className="h-full w-full border rounded-lg">
            <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                        <TableHead>Nº Solicitação</TableHead>
                        <TableHead>Data Solicitação</TableHead>
                        <TableHead>Solicitante</TableHead>
                        <TableHead>Obra</TableHead>
                        <TableHead>Descrição do Insumo</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                🎉 Nenhuma solicitação pendente de conversão!
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredData.map((d, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{d.requestNumber}</TableCell>
                                <TableCell>{d.requestDate}</TableCell>
                                <TableCell>{d.buyer}</TableCell> {/* Solicitante */}
                                <TableCell>{d.project}</TableCell>
                                <TableCell>{d.itemDescription}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </ScrollArea>
    );
};

const TableGargaloExterno: React.FC<{ data: DemandaConsolidada[] }> = ({ data }) => {
    const filteredData = useMemo(() => {
        return data.filter(d => !!d.orderNumber && !d.orderStatus?.toLowerCase().includes('totalmente entregue'));
    }, [data]);

    return (
        <ScrollArea className="h-full w-full border rounded-lg">
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
                                Todos os pedidos em aberto foram entregues.
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

export const ActionTabs: React.FC<ActionTabsProps> = ({ data }) => {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Gestão de Gargalos</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow p-0 pb-6 px-6 flex flex-col min-h-0">
                <Tabs defaultValue="interno" className="h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="interno">Gargalo Interno</TabsTrigger>
                        <TabsTrigger value="externo">Gargalo Externo</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="interno" className="mt-4 flex-grow min-h-0">
                        <TableGargaloInterno data={data} />
                    </TabsContent>
                    
                    <TabsContent value="externo" className="mt-4 flex-grow min-h-0">
                        <TableGargaloExterno data={data} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};