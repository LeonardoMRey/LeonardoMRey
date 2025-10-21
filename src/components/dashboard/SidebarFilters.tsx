import React, { useMemo } from 'react';
import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DashboardFilters } from './Dashboard';
import { ProcessedData } from './types';

interface SidebarFiltersProps {
  data: ProcessedData;
  filters: DashboardFilters;
  setFilters: React.Dispatch<React.SetStateAction<DashboardFilters>>;
  onClose: () => void;
}

export const SidebarFilters: React.FC<SidebarFiltersProps> = ({ data, filters, setFilters, onClose }) => {
  
  const { uniqueResponsaveis, uniqueStatuses, uniqueFornecedores } = useMemo(() => {
    const responsaveis = new Set<string>();
    const statuses = new Set<string>();
    const fornecedores = new Set<string>();

    data.solicitacoes.forEach(s => {
      if (s.buyer) responsaveis.add(s.buyer);
      if (s.status) statuses.add(s.status);
    });
    data.compras.forEach(c => {
      if (c.supplier) fornecedores.add(c.supplier);
    });

    return {
      uniqueResponsaveis: ["all", ...Array.from(responsaveis).sort()],
      uniqueStatuses: ["all", ...Array.from(statuses).sort()],
      uniqueFornecedores: ["all", ...Array.from(fornecedores).sort()],
    };
  }, [data]);

  const handleFilterChange = (key: keyof DashboardFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      responsavel: 'all',
      status: 'all',
      fornecedor: 'all',
      periodo: 'all',
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center text-primary">
          <Filter className="w-5 h-5 mr-2" /> Filtros
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>
      <Separator className="mb-4" />
      
      <ScrollArea className="flex-grow pr-2">
        <div className="space-y-6">
          
          {/* Filtro de Responsável */}
          <div>
            <label className="text-sm font-medium mb-2 block">Responsável (Comprador)</label>
            <Select value={filters.responsavel} onValueChange={(v) => handleFilterChange('responsavel', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos Responsáveis" />
              </SelectTrigger>
              <SelectContent>
                {uniqueResponsaveis.map(r => (
                  <SelectItem key={r} value={r}>{r === 'all' ? 'Todos Responsáveis' : r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Status (Solicitações) */}
          <div>
            <label className="text-sm font-medium mb-2 block">Status da Solicitação</label>
            <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos Status" />
              </SelectTrigger>
              <SelectContent>
                {uniqueStatuses.map(s => (
                  <SelectItem key={s} value={s}>{s === 'all' ? 'Todos Status' : s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Fornecedor (Pedidos) */}
          <div>
            <label className="text-sm font-medium mb-2 block">Fornecedor</label>
            <Select value={filters.fornecedor} onValueChange={(v) => handleFilterChange('fornecedor', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos Fornecedores" />
              </SelectTrigger>
              <SelectContent>
                {uniqueFornecedores.map(f => (
                  <SelectItem key={f} value={f}>{f === 'all' ? 'Todos Fornecedores' : f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Período */}
          <div>
            <label className="text-sm font-medium mb-2 block">Período de Análise</label>
            <Select value={filters.periodo} onValueChange={(v) => handleFilterChange('periodo', v as DashboardFilters['periodo'])}>
              <SelectTrigger>
                <SelectValue placeholder="Todo Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo Período</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="1y">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ScrollArea>

      <div className="mt-4 pt-4 border-t border-border">
        <Button variant="secondary" className="w-full" onClick={handleResetFilters}>
          Limpar Filtros
        </Button>
      </div>
    </div>
  );
};