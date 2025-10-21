import { useMemo, useState } from "react";
import { Solicitacao, Compra } from "@/types/data";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileText, Filter } from "lucide-react";
import { ExportMenu } from "./ExportMenu";
import { SolicitacoesPanel } from "./SolicitacoesPanel";
import { PedidosPanel } from "./PedidosPanel";
import { PendenciasPanel } from "./PendenciasPanel";
import { Separator } from "@/components/ui/separator";
import { SidebarFilters } from "./SidebarFilters";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SolicitacaoProcessada, ProcessedData } from "./types";
import { parse } from 'date-fns';

interface DashboardProps {
  solicitacoesData: Solicitacao[];
  comprasData: Compra[];
  onReset: () => void;
}

// Define o tipo para os filtros globais
export interface DashboardFilters {
  responsavel: string;
  status: string;
  fornecedor: string;
  periodo: 'all' | '30d' | '90d' | '1y';
}

export const Dashboard = ({ solicitacoesData, comprasData, onReset }: DashboardProps) => {
  const [filters, setFilters] = useState<DashboardFilters>({
    responsavel: 'all',
    status: 'all',
    fornecedor: 'all',
    periodo: 'all',
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 1. Pré-processamento e Conexão de Dados
  const processedData: ProcessedData = useMemo(() => {
    // Mapeia pedidos para fácil lookup
    const ordersMap = new Map(comprasData.map(c => [c.orderNumber, c]));

    // Tenta vincular solicitações a pedidos
    const solicitacoesWithLinks: SolicitacaoProcessada[] = solicitacoesData.map(s => {
      const linkedOrder = s.linkedOrderNumber ? ordersMap.get(s.linkedOrderNumber) : undefined;
      return {
        ...s,
        linkedOrder: linkedOrder,
        isLinked: !!linkedOrder,
      };
    });

    // Identifica pedidos sem solicitação de origem (emissão direta)
    const linkedOrderNumbers = new Set(solicitacoesData.map(s => s.linkedOrderNumber).filter(Boolean));
    const comprasSemSolicitacao = comprasData.filter(c => !linkedOrderNumbers.has(c.orderNumber));

    return {
      solicitacoes: solicitacoesWithLinks,
      compras: comprasData,
      comprasSemSolicitacao,
    };
  }, [solicitacoesData, comprasData]);

  // 2. Aplicação de Filtros (Lógica de filtragem completa)
  const filteredData = useMemo(() => {
    const { responsavel, status, fornecedor, periodo } = filters;
    const today = new Date();
    
    const filterByPeriod = (dateString: string | undefined): boolean => {
      if (periodo === 'all' || !dateString) return true;
      
      try {
        const date = parse(dateString, 'dd/MM/yyyy', new Date());
        let cutoffDate = new Date();
        
        if (periodo === '30d') cutoffDate.setDate(today.getDate() - 30);
        else if (periodo === '90d') cutoffDate.setDate(today.getDate() - 90);
        else if (periodo === '1y') cutoffDate.setFullYear(today.getFullYear() - 1);
        
        return date >= cutoffDate;
      } catch {
        return false;
      }
    };

    const filteredSolicitacoes = processedData.solicitacoes.filter(s => {
      const responsavelMatch = responsavel === 'all' || s.buyer === responsavel;
      const statusMatch = status === 'all' || s.status === status;
      const periodMatch = filterByPeriod(s.requestDate);
      
      // Ignora filtro de fornecedor para solicitações
      return responsavelMatch && statusMatch && periodMatch;
    });

    const filteredCompras = processedData.compras.filter(c => {
      const responsavelMatch = responsavel === 'all' || c.buyer === responsavel;
      const fornecedorMatch = fornecedor === 'all' || c.supplier === fornecedor;
      const periodMatch = filterByPeriod(c.deliveryDate); // Usando data de entrega como proxy
      
      // Ignora filtro de status para compras
      return responsavelMatch && fornecedorMatch && periodMatch;
    });

    // Recalcula compras sem solicitação dentro do filtro
    const filteredLinkedOrderNumbers = new Set(filteredSolicitacoes.map(s => s.linkedOrderNumber).filter(Boolean));
    const filteredComprasSemSolicitacao = filteredCompras.filter(c => !filteredLinkedOrderNumbers.has(c.orderNumber));


    return {
      solicitacoes: filteredSolicitacoes,
      compras: filteredCompras,
      comprasSemSolicitacao: filteredComprasSemSolicitacao,
    };
  }, [processedData, filters]);


  return (
    <div className="flex h-full min-h-[80vh]">
      {/* Sidebar de Filtros */}
      {isSidebarOpen && (
        <div className="w-64 border-r border-border p-4 flex-shrink-0">
          <SidebarFilters 
            data={processedData} 
            filters={filters} 
            setFilters={setFilters} 
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className={`flex-grow p-4 transition-all duration-300 ${isSidebarOpen ? 'ml-0' : 'ml-0'}`}>
        <ScrollArea className="h-[80vh] pr-4">
          <div className="space-y-8">
            {/* Header e Ações */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <FileText className="h-4 w-4 text-primary" />
                <span>Dados carregados com sucesso.</span>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                  <Filter className="mr-2 h-4 w-4" />
                  {isSidebarOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                </Button>
                <ExportMenu solicitacoesData={filteredData.solicitacoes} comprasData={filteredData.compras} />
                <Button onClick={onReset} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Carregar Novos Arquivos
                </Button>
              </div>
            </div>

            <Separator />

            {/* Painéis */}
            <SolicitacoesPanel solicitacoesData={filteredData.solicitacoes} />
            
            <PedidosPanel comprasData={filteredData.compras} />

            <PendenciasPanel 
              solicitacoesData={filteredData.solicitacoes} 
              comprasData={filteredData.compras} 
              comprasSemSolicitacao={filteredData.comprasSemSolicitacao}
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};