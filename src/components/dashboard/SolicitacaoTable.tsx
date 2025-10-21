import { useState, useMemo } from 'react';
import { Solicitacao } from '@/types/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface SolicitacaoTableProps {
  solicitacoesData: Solicitacao[];
  comprasData: any[]; // Não usaremos comprasData diretamente aqui, mas mantemos a tipagem para consistência futura
}

const getStatusColor = (status: string) => {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes('atendida') || lowerStatus.includes('entregue')) {
    return 'bg-green-600 hover:bg-green-700'; // Verde
  }
  if (lowerStatus.includes('cotado') || lowerStatus.includes('em andamento')) {
    return 'bg-yellow-600 hover:bg-yellow-700'; // Amarelo
  }
  if (lowerStatus.includes('pendente') || lowerStatus.includes('solicitado')) {
    return 'bg-red-600 hover:bg-red-700'; // Vermelho
  }
  return 'bg-gray-500 hover:bg-gray-600'; // Cinza
};

export const SolicitacaoTable = ({ solicitacoesData }: SolicitacaoTableProps) => {
  const [globalSearch, setGlobalSearch] = useState('');
  const [buyerFilter, setBuyerFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { uniqueBuyers, uniqueProjects, uniqueStatuses } = useMemo(() => {
    const buyers = new Set<string>();
    const projects = new Set<string>();
    const statuses = new Set<string>();

    solicitacoesData.forEach(s => {
      if (s.buyer) buyers.add(s.buyer);
      if (s.project) projects.add(s.project);
      if (s.status) statuses.add(s.status);
    });

    return {
      uniqueBuyers: ["all", ...Array.from(buyers).sort()],
      uniqueProjects: ["all", ...Array.from(projects).sort()],
      uniqueStatuses: ["all", ...Array.from(statuses).sort()],
    };
  }, [solicitacoesData]);

  const filteredData = useMemo(() => {
    const searchLower = globalSearch.toLowerCase();

    return solicitacoesData.filter(item => {
      // Filtros de Select
      const buyerMatch = buyerFilter === "all" || item.buyer === buyerFilter;
      const projectMatch = projectFilter === "all" || item.project === projectFilter;
      const statusMatch = statusFilter === "all" || item.status === statusFilter;

      // Busca Global (Nº solicitação, Insumo, Fornecedor - Fornecedor não está em Solicitacao, mas incluímos para o futuro)
      const globalMatch = searchLower === '' || 
        item.requestNumber?.toLowerCase().includes(searchLower) ||
        item.itemDescription?.toLowerCase().includes(searchLower) ||
        item.buyer?.toLowerCase().includes(searchLower) ||
        item.project?.toLowerCase().includes(searchLower);

      return buyerMatch && projectMatch && statusMatch && globalMatch;
    });
  }, [solicitacoesData, globalSearch, buyerFilter, projectFilter, statusFilter]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tabela Dinâmica de Solicitações</CardTitle>
        <div className="mt-4 flex flex-wrap gap-4">
          <Input
            placeholder="Buscar por Nº Solicitação, Insumo, Comprador..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full md:w-[300px]"
          />
          <Select value={buyerFilter} onValueChange={setBuyerFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Comprador" />
            </SelectTrigger>
            <SelectContent>
              {uniqueBuyers.map(r => <SelectItem key={r} value={r}>{r === 'all' ? 'Todos Compradores' : r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Obra" />
            </SelectTrigger>
            <SelectContent>
              {uniqueProjects.map(p => <SelectItem key={p} value={p}>{p === 'all' ? 'Todas Obras' : p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {uniqueStatuses.map(s => <SelectItem key={s} value={s}>{s === 'all' ? 'Todos Status' : s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Solicitação</TableHead>
                <TableHead>Insumo</TableHead>
                <TableHead>Comprador</TableHead>
                <TableHead>Obra</TableHead>
                <TableHead>Data Previsão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Qtd. Pendente</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item, index) => (
                <TableRow key={`${item.requestNumber}-${index}`}>
                  <TableCell className="font-medium">{item.requestNumber}</TableCell>
                  <TableCell>{item.itemDescription}</TableCell>
                  <TableCell>{item.buyer}</TableCell>
                  <TableCell>{item.project}</TableCell>
                  <TableCell>{item.deliveryDate}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{item.pendingQuantity}</TableCell>
                </TableRow>
              ))}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                    Nenhuma solicitação encontrada com os filtros aplicados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};