import { useState, useMemo } from "react";
import Papa from "papaparse";
import { DemandaConsolidada } from "@/types/data";
import { FileUpload } from "@/components/dashboard/FileUpload";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Toaster } from "@/components/ui/sonner";
import { showError, showSuccess } from "@/utils/toast";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { DateRange } from "react-day-picker";
import { parseDateString } from "@/utils/data-processing";
import { isWithinInterval } from "date-fns";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

const DEMANDA_MAPPING: { [key: string]: keyof DemandaConsolidada } = {
  "Nº da Solicitação": "requestNumber", "Descrição do insumo": "itemDescription", "Situação da solicitação": "requestStatus", "Data da solicitação": "requestDate", "Comprador distribuído": "buyer", "Obra": "project", "Situação autorização do item": "authorizationStatus", "N° do Pedido": "orderNumber", "Fornecedor": "supplier", "Situação do pedido": "orderStatus", "Valor da nota": "invoiceValue", "Previsão de entrega": "deliveryForecast", "Quantidade solicitada": "requestedQuantity", "Quantidade entregue": "deliveredQuantity", "Saldo": "pendingQuantity", "Data do pedido": "orderDate", "Data entrega na obra": "actualDeliveryDate",
};

const parseNumber = (value: string | number | undefined): number => {
  if (typeof value === 'number') return value;
  if (!value || typeof value !== 'string') return 0;
  const cleanedValue = value.replace("R$", "").trim().replace(/\./g, "").replace(",", ".");
  const num = parseFloat(cleanedValue);
  return isNaN(num) ? 0 : num;
};

const IndexPage = () => {
  const [demandas, setDemandas] = useState<DemandaConsolidada[]>([]);
  const [demandaFile, setDemandaFile] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedBuyer, setSelectedBuyer] = useState<string>("");

  const handleFileUpload = (file: File) => {
    Papa.parse(file, {
      header: true, skipEmptyLines: true, delimiter: ";", trimHeaders: true,
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

  const { projectOptions, buyerOptions } = useMemo(() => {
    const projects = new Set<string>(); const buyers = new Set<string>();
    demandas.forEach(d => {
      if (d.project) projects.add(d.project);
      if (d.buyer) buyers.add(d.buyer);
    });
    return { projectOptions: Array.from(projects).sort(), buyerOptions: Array.from(buyers).sort() };
  }, [demandas]);

  const filteredDemandas = useMemo(() => {
    return demandas.filter(d => {
      const requestDate = parseDateString(d.requestDate);
      const isDateInRange = !dateRange?.from || !requestDate || isWithinInterval(requestDate, { start: dateRange.from, end: dateRange.to || dateRange.from });
      const isProjectMatch = !selectedProject || selectedProject === 'all' || d.project === selectedProject;
      const isBuyerMatch = !selectedBuyer || selectedBuyer === 'all' || d.buyer === selectedBuyer;
      return isDateInRange && isProjectMatch && isBuyerMatch;
    });
  }, [demandas, dateRange, selectedProject, selectedBuyer]);

  const clearFilters = () => { setDateRange(undefined); setSelectedProject(""); setSelectedBuyer(""); };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[180px_1fr] lg:grid-cols-[200px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <div className="w-full flex-1"></div>
          <Button variant="secondary" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold md:text-2xl">Painel de Gestão de Compras</h1>
            {demandas.length > 0 && (
              <DashboardFilters
                dateRange={dateRange} setDateRange={setDateRange}
                project={selectedProject} setProject={setSelectedProject}
                buyer={selectedBuyer} setBuyer={setSelectedBuyer}
                projectOptions={projectOptions} buyerOptions={buyerOptions}
                clearFilters={clearFilters}
              />
            )}
          </div>
          
          {demandas.length > 0 ? (
            <Dashboard data={filteredDemandas} />
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

export default IndexPage;