import { useState, useMemo } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import Papa from "papaparse";
import { DemandaConsolidada } from "@/types/data";
import { FileUpload } from "@/components/dashboard/FileUpload";
import { Toaster } from "@/components/ui/sonner";
import { showError, showSuccess } from "@/utils/toast";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

const DEMANDA_MAPPING: { [key: string]: keyof DemandaConsolidada } = {
  "nº da solicitação": "requestNumber",
  "descrição do insumo": "itemDescription",
  "situação da solicitação": "requestStatus",
  "data da solicitação": "requestDate",
  "comprador distribuído": "buyer",
  "obra": "project",
  "situação autorização do item": "authorizationStatus",
  "n° do pedido": "orderNumber",
  "fornecedor": "supplier",
  "situação do pedido": "orderStatus",
  "valor da nota": "invoiceValue",
  "previsão de entrega": "deliveryForecast",
  "quantidade solicitada": "requestedQuantity",
  "quantidade entregue": "deliveredQuantity",
  "saldo": "pendingQuantity",
  "data do pedido": "orderDate",
  "data entrega na obra": "actualDeliveryDate",
  "grupo de insumo": "grupoInsumo",
  "status pagamento": "statusPagamento",
};

const parseNumber = (value: string | number | undefined): number => {
  if (typeof value === 'number') return value;
  if (!value || typeof value !== 'string') return 0;
  const cleanedValue = value.replace("R$", "").trim().replace(/\./g, "").replace(",", ".");
  const num = parseFloat(cleanedValue);
  return isNaN(num) ? 0 : num;
};

type DashboardContextType = {
  demandas: DemandaConsolidada[];
};

export function useAllDemandas() {
  return useOutletContext<DashboardContextType>();
}

const DashboardLayout = () => {
  const [demandas, setDemandas] = useState<DemandaConsolidada[]>([]);
  const [demandaFile, setDemandaFile] = useState<string>("");
  const [pageTitle, setPageTitle] = useState("Desempenho Operacional");

  const handleFileUpload = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ";",
      trimHeaders: true,
      transformHeader: header => header.toLowerCase().trim(),
      complete: (results) => {
        if (results.errors.length > 0) { showError(`Erro ao processar o arquivo.`); return; }
        const mappedData = results.data.map((row: any) => {
          const newRow: Partial<DemandaConsolidada> = {};
          for (const key in row) {
            if (DEMANDA_MAPPING[key]) {
              const newKey = DEMANDA_MAPPING[key];
              let value = row[key];
              if (['invoiceValue', 'requestedQuantity', 'deliveredQuantity', 'pendingQuantity'].includes(newKey)) {
                (newRow as any)[newKey] = parseNumber(value);
              } else { (newRow as any)[newKey] = value || ''; }
            }
          }
          return newRow as DemandaConsolidada;
        }).filter(row => row.requestNumber || row.orderNumber);

        if (mappedData.length === 0) { showError("Nenhuma linha de dados válida foi encontrada."); return; }
        setDemandas(mappedData); setDemandaFile(file.name);
        showSuccess(`Arquivo "${file.name}" carregado com ${mappedData.length} linhas.`);
      },
      error: () => showError("Ocorreu um erro inesperado ao ler o arquivo.")
    });
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar setPageTitle={setPageTitle} />
      <div className="flex flex-col bg-gradient-to-br from-background to-gray-900/50">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <div className="w-full flex-1">
             <h1 className="text-lg font-semibold md:text-2xl">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {demandas.length > 0 ? (
            <Outlet context={{ demandas }} />
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
              <div className="grid md:grid-cols-1 gap-8 max-w-lg mx-auto">
                <FileUpload 
                  onFileUpload={handleFileUpload} 
                  title="Carregar Relatório Consolidado de Compras"
                  fileName={demandaFile}
                />
              </div>
            </div>
          )}
        </main>
        <Footer />
        <Toaster theme="dark" />
      </div>
    </div>
  );
};

export default DashboardLayout;