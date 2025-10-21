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
                        <TableHead>Data</TableHead>
                        <TableHead>Solicitante</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.length === 0 ? (
                        <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">🎉 Nenhuma pendência!</TableCell></TableRow>
                    ) : (
                        filteredData.map((d, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{d.requestNumber}</TableCell>
                                <TableCell>{d.requestDate}</TableCell>
                                <TableCell>{d.buyer}</TableCell>
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
                        <TableHead>Previsão</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.length === 0 ? (
                        <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">Nenhum pedido pendente.</TableCell></TableRow>
                    ) : (
                        filteredData.map((d, index) => {
                            const isAtrasado = isDateBeforeToday(d.deliveryForecast);
                            return (
                                <TableRow key={index} className={cn(isAtrasado && 'bg-destructive/20 hover:bg-destructive/30')}>
                                    <TableCell className="font-medium">{d.orderNumber}</TableCell>
                                    <TableCell>{d.supplier}</TableCell>
                                    <TableCell className={cn(isAtrasado && 'text-destructive font-semibold')}>{d.deliveryForecast}</TableCell>
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
            <CardContent className="flex-grow p-4 flex flex-col min-h-0">
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