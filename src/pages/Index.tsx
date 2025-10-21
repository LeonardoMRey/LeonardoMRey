import { useState } from "react";
import Papa from "papaparse";
import { Demanda } from "@/types/data";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FileUpload } from "@/components/dashboard/FileUpload";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Toaster } from "@/components/ui/sonner";
import { showError } from "@/utils/toast";

// Mapeamento para o Relatório Unificado de Demandas
const DEMANDA_MAPPING: { [key: string]: keyof Demanda } = {
  "Nº da Solicitação": "requestNumber",
  "Descrição do insumo": "itemDescription",
  "Situação da solicitação": "requestStatus",
  "Data da solicitação": "requestDate",
  "Comprador distribuído": "buyer",
  "Obra": "project",
  "Situação autorização do item": "authorization",
  
  // Campos de Pedido/Compra
  "N° do Pedido": "orderNumber",
  "Fornecedor": "supplier",
  "Situação do pedido": "deliveryStatus",
  "Valor da nota": "netValue", // Usando Valor da nota como valor líquido
  "Previsão de entrega": "deliveryDate",
  
  // Campos de Quantidade (Novos nomes)
  "Quantidade solicitada": "requestedQuantity",
  "Quantidade entregue": "deliveredQuantity",
  "Saldo": "pendingQuantity",
};

const parseNumber = (value: string | number | undefined): number => {
  if (typeof value === 'number') return value;
  if (!value || typeof value !== 'string') return 0;
  
  // Remove R$, remove pontos de milhar e substitui vírgula por ponto decimal
  const cleanedValue = value
    .replace("R$", "")
    .trim()
    .replace(/\./g, "") // Remove separador de milhar (ponto)
    .replace(",", "."); // Substitui separador decimal (vírgula) por ponto
    
  const num = parseFloat(cleanedValue);
  return isNaN(num) ? 0 : num;
};

const IndexPage = () => {
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [demandaFile, setDemandaFile] = useState<string>("");

  const handleFileUpload = (file: File) => {
    const numberFields: (keyof Demanda)[] = [
      'netValue', 
      'requestedQuantity', 
      'deliveredQuantity', 
      'pendingQuantity',
    ];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ";",
      trimHeaders: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          showError(`Erro ao processar o arquivo. Verifique o formato.`);
          console.error("CSV Errors:", results.errors);
          return;
        }
        
        const mappedData = results.data.map((row: any) => {
          const newRow: Partial<Demanda> = {};
          for (const key in row) {
            if (DEMANDA_MAPPING[key]) {
              const newKey = DEMANDA_MAPPING[key];
              if (numberFields.includes(newKey)) {
                (newRow as any)[newKey] = parseNumber(row[key]);
              } else {
                // Mapeamento especial para Comprador (que pode vir como 'Nenhum')
                if (newKey === 'buyer' && row[key] === 'Nenhum') {
                    (newRow as any)[newKey] = '';
                } else {
                    (newRow as any)[newKey] = row[key];
                }
              }
            }
          }
          return newRow;
        }).filter(row => {
          // Uma linha é válida se tiver um número de solicitação OU um número de pedido.
          const hasRequest = !!(row as Demanda).requestNumber;
          const hasOrder = !!(row as Demanda).orderNumber;
          return hasRequest || hasOrder;
        });

        if (mappedData.length === 0) {
          showError("Nenhuma linha de dados válida foi encontrada no arquivo.");
          setDemandas([]);
          setDemandaFile("");
          return;
        }

        setDemandas(mappedData as Demanda[]);
        setDemandaFile(file.name);
      },
      error: (error) => {
        showError("Ocorreu um erro inesperado ao ler o arquivo.");
        console.error("PapaParse Error:", error);
      }
    });
  };

  const handleReset = () => {
    setDemandas([]);
    setDemandaFile("");
  };

  const showDashboard = demandas.length > 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {showDashboard ? (
          <Dashboard demandasData={demandas} onReset={handleReset} />
        ) : (
          <div className="grid md:grid-cols-1 gap-8 mt-10 max-w-lg mx-auto">
            <FileUpload 
              onFileUpload={handleFileUpload} 
              title="Carregar Relatório Unificado de Demandas"
              fileName={demandaFile}
            />
          </div>
        )}
      </main>
      <Footer />
      <Toaster theme="dark" />
    </div>
  );
};

export default IndexPage;