import { useMemo, useState } from "react";
import { Demanda } from "@/types/data";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileText, Filter } from "lucide-react";
import { ExportMenu } from "./ExportMenu";
import { SolicitacoesPanel } from "./SolicitacoesPanel";
import { PedidosPanel } from "./PedidosPanel";
import { PendenciasPanel } from "./PendenciasPanel";
import { Separator } from "@/components/ui/separator";
import { SidebarFilters } from "./SidebarFilters";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DemandaProcessada, ProcessedData } from "./types";
import { parse, isValid } from 'date-fns';

interface DashboardProps {
  demandasData: Demanda[];
  onReset: () => void;
}

// Define o tipo para os filtros globais
export interface DashboardFilters {
  responsavel: string;
  status: string;
  fornecedor: string;
  periodo: 'all' | '30d' | '90d' | '1y';
}

export const Dashboard = ({ demandasData, onReset }: DashboardProps) => {
  const [filters, setFilters] = useState<DashboardFilters>({
    responsavel: 'all',
    status: 'all',
    fornecedor: 'all',
    periodo: 'all',
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 1. Pré-processamento e Conexão de Dados
  const processedData: ProcessedData = useMemo(() => {
    // A Demanda já contém todas as informações. Apenas adicionamos o flag isLinked.
    const processedDemandas: DemandaProcessada[] = demandasData.map(d => ({
      ...d,
      isLinked: !!d.orderNumber,
    }));

    return {
      demandas: processedDemandas,
    };
  }, [demandasData]);

  // 2. Aplicação de Filtros (Lógica de filtragem completa)
  const filteredData = useMemo(() => {
    const { responsavel, status, fornecedor, periodo } = filters;
    const today = new Date();
    
    const filterByPeriod = (dateString: string | undefined): boolean => {
      if (periodo === 'all' || !dateString) return true;
      
      try {
        const date = parse(dateString, 'dd/MM/yyyy', new Date());
        if (!isValid(date)) return true; // Se a data for inválida, não filtra o item

        let cutoffDate = new Date();
        
        if (periodo === '30d') cutoffDate.setDate(today.getDate() - 30);
        else if (periodo === '90d') cutoffDate.setDate(today.getDate() - 90);
        else if (periodo === '1y') cutoffDate.setFullYear(today.getFullYear() - 1);
        
        return date >= cutoffDate;
      } catch {
        return true; // Permanece leniente se o parse falhar
      }
    };

    const filteredDemandas = processedData.demandas.filter(d => {
      const responsavelMatch = responsavel === 'all' || d.buyer === responsavel;
      const statusMatch = status === 'all' || d.requestStatus === status;
      const fornecedorMatch = fornecedor === 'all' || d.supplier === fornecedor;
      const periodMatch = filterByPeriod(d.requestDate); // Filtra pela data de solicitação
      
      return responsavelMatch && statusMatch && fornecedorMatch && periodMatch;
    });

    // Separa as demandas em grupos lógicos para os painéis
    const solicitacoes = filteredDemandas.filter(d => !!d.requestNumber);
    const pedidos = filteredDemandas.filter(d => !!d.orderNumber);
    
    // Pedidos de Emissão Direta: Têm número de pedido, mas não têm número de solicitação
    const comprasSemSolicitacao = pedidos.filter(d => !d.requestNumber);


    return {
      demandas: filteredDemandas,
      solicitacoes,
      pedidos,
      comprasSemSolicitacao,
    };
  }, [processedData, filters]);


  return (
    <div className="flex h-full min-h-[80vh]">
      {/* Sidebar de Filtros */}
      {isSidebarOpen && (
        <div className="w-64 border-r border-border p-4 flex-shrink-0">
          <SidebarFilters 
            data={{
              demandas: processedData.demandas,
              // Mantendo a estrutura antiga para SidebarFilters funcionar
              solicitacoes: processedData.demandas,
              compras: processedData.demandas.filter(d => !!d.orderNumber),
              comprasSemSolicitacao: processedData.demandas.filter(d => !!d.orderNumber && !d.requestNumber),
            }} 
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
                {/* ExportMenu precisa ser atualizado para usar Demanda[] */}
                <ExportMenu solicitacoesData={filteredData.solicitacoes as any} comprasData={filteredData.pedidos as any} />
                <Button onClick={onReset} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Carregar Novo Arquivo
                </Button>
              </div>
            </div>

            <Separator />

            {/* Painéis */}
            <SolicitacoesPanel solicitacoesData={filteredData.solicitacoes as any} />
            
            <PedidosPanel comprasData={filteredData.pedidos as any} />

            <PendenciasPanel 
              solicitacoesData={filteredData.solicitacoes as any} 
              comprasData={filteredData.pedidos as any} 
              comprasSemSolicitacao={filteredData.comprasSemSolicitacao as any}
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};