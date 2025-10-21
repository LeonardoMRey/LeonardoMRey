import { useState } from "react";
import Papa from "papaparse";
import { DemandaConsolidada } from "@/types/data";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FileUpload } from "@/components/dashboard/FileUpload";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Toaster } from "@/components/ui/sonner";
import { showError, showSuccess } from "@/utils/toast";

// Mapeamento de Colunas do CSV para a interface DemandaConsolidada
const DEMANDA_MAPPING: { [key: string]: keyof DemandaConsolidada } = {
  "Nº da Solicitação": "requestNumber",
  "Descrição do insumo": "itemDescription",
  "Situação da solicitação": "requestStatus",
  "Data da solicitação": "requestDate",
  "Comprador distribuído": "buyer",
  "Obra": "project",
  "Situação autorização do item": "authorizationStatus",
  
  "N° do Pedido": "orderNumber",
  "Fornecedor": "supplier",
  "Situação do pedido": "orderStatus",
  "Valor da nota": "invoiceValue",
  "Previsão de entrega": "deliveryForecast",
  
  "Quantidade solicitada": "requestedQuantity",
  "Quantidade entregue": "deliveredQuantity",
  "Saldo": "pendingQuantity",
  
  // Nota: 'Data do pedido' e 'Solicitante' não estão presentes no CSV anexo.
};

const parseNumber = (value: string | number | undefined): number => {
  if (typeof value === 'number') return value;
  if (!value || typeof value !== 'string') return 0;
  
  // Remove R$, remove pontos de milhar e substitui vírgula por ponto decimal (Formato Brasileiro)
  const cleanedValue = value
    .replace("R$", "")
    .trim()
    .replace(/\./g, "") // Remove separador de milhar (ponto)
    .replace(",", "."); // Substitui separador decimal (vírgula) por ponto
    
  const num = parseFloat(cleanedValue);
  return isNaN(num) ? 0 : num;
};

const IndexPage = () => {
  const [demandas, setDemandas] = useState<DemandaConsolidada[]>([]);
  const [demandaFile, setDemandaFile] = useState<string>("");

  const handleFileUpload = (file: File) => {
    const numberFields: (keyof DemandaConsolidada)[] = [
      'invoiceValue', 
      'requestedQuantity', 
      'deliveredQuantity', 
      'pendingQuantity',
    ];
    
    // Campos que devem ser tratados como strings vazias se forem 'Nenhum' ou nulos
    const stringFields: (keyof DemandaConsolidada)[] = [
        'buyer', 'orderNumber', 'supplier', 'orderStatus', 'deliveryForecast'
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
          const newRow: Partial<DemandaConsolidada> = {};
          
          // Mapeamento e conversão de tipos
          for (const key in row) {
            if (DEMANDA_MAPPING[key]) {
              const newKey = DEMANDA_MAPPING[key];
              let value = row[key];
              
              if (numberFields.includes(newKey)) {
                (newRow as any)[newKey] = parseNumber(value);
              } else {
                // Tratar valores como 'Nenhum' ou vazios como string vazia para campos chave
                if (stringFields.includes(newKey) && (value === 'Nenhum' || value === null || value === undefined)) {
                    value = '';
                }
                (newRow as any)[newKey] = value || '';
              }
            }
          }
          
          // Adicionando itemDescription que é crucial
          if (!newRow.itemDescription && row["Descrição do insumo"]) {
              newRow.itemDescription = row["Descrição do insumo"];
          }

          return newRow;
        }).filter(row => {
          // Uma linha é válida se tiver um número de solicitação OU um número de pedido.
          const hasRequest = !!(row as DemandaConsolidada).requestNumber;
          const hasOrder = !!(row as DemandaConsolidada).orderNumber;
          return hasRequest || hasOrder;
        });

        if (mappedData.length === 0) {
          showError("Nenhuma linha de dados válida foi encontrada no arquivo.");
          setDemandas([]);
          setDemandaFile("");
          return;
        }

        setDemandas(mappedData as DemandaConsolidada[]);
        setDemandaFile(file.name);
        showSuccess(`Arquivo "${file.name}" carregado com sucesso! ${mappedData.length} linhas processadas.`);
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
          <Dashboard data={demandas} />
        ) : (
          <div className="grid md:grid-cols-1 gap-8 mt-10 max-w-lg mx-auto">
            <FileUpload 
              onFileUpload={handleFileUpload} 
              title="Carregar Relatório Consolidado de Compras"
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