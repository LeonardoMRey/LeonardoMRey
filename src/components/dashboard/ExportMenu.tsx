import { FileText, FileDown, FileType2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useExport } from '@/hooks/use-export';
import { Demanda } from '@/types/data';

interface ExportMenuProps {
  solicitacoesData: Demanda[];
  comprasData: Demanda[];
}

export const ExportMenu = ({ solicitacoesData, comprasData }: ExportMenuProps) => {
  const { exportToCSV, exportToPDF } = useExport();

  const solicitacaoOptions = {
    title: "Relatório de Solicitações",
    headers: ["Nº Solicitação", "Insumo", "Status", "Data Solicitação", "Comprador", "Obra", "Qtd. Solicitada", "Qtd. Entregue", "Autorização"],
    keys: ["requestNumber", "itemDescription", "requestStatus", "requestDate", "buyer", "project", "requestedQuantity", "deliveredQuantity", "authorization"] as (keyof Demanda)[],
  };

  const compraOptions = {
    title: "Relatório de Compras",
    headers: ["Nº Pedido", "Obra", "Comprador", "Fornecedor", "Status Entrega", "Valor Líquido", "Data Prevista", "Qtd. Entregue", "Saldo Pendente"],
    keys: ["orderNumber", "project", "buyer", "supplier", "deliveryStatus", "netValue", "deliveryDate", "deliveredQuantity", "pendingQuantity"] as (keyof Demanda)[],
  };

  const handleExport = (type: 'solicitacao' | 'compra', format: 'csv' | 'pdf') => {
    const data = type === 'solicitacao' ? solicitacoesData : comprasData;
    const options = type === 'solicitacao' ? solicitacaoOptions : compraOptions;
    const filename = options.title.replace(/ /g, '_');

    if (format === 'csv') {
      exportToCSV(data, filename, options);
    } else {
      exportToPDF(data, filename, options);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatórios
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-card border-border">
        <DropdownMenuLabel className="text-accent">Exportar Solicitações</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleExport('solicitacao', 'csv')}>
          <FileType2 className="mr-2 h-4 w-4" /> CSV (Excel)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('solicitacao', 'pdf')}>
          <FileText className="mr-2 h-4 w-4" /> PDF
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-accent">Exportar Compras</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleExport('compra', 'csv')}>
          <FileType2 className="mr-2 h-4 w-4" /> CSV (Excel)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('compra', 'pdf')}>
          <FileText className="mr-2 h-4 w-4" /> PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};