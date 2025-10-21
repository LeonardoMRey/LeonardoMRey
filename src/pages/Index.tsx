import { useState } from "react";
import Papa from "papaparse";
import { SiengeData } from "@/types/sienge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FileUpload } from "@/components/dashboard/FileUpload";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Toaster } from "@/components/ui/sonner";
import { showError } from "@/utils/toast";

// Mapeamento das colunas do CSV para chaves mais amigáveis
const COLUMN_MAPPING: { [key: string]: keyof SiengeData } = {
  "Data da solicitação": "requestDate",
  "Solicitante": "requester",
  "Comprador": "responsible",
  "Situação da solicitação": "stage",
  "Situação do pedido": "status",
  "Valor da nota": "value",
  "Fornecedor": "supplier",
  "Previsão de entrega": "deliveryDate",
  "Nº da Solicitação": "requestNumber",
  "Descrição do insumo": "itemDescription",
};

const parseValue = (value: string): number => {
  if (!value || typeof value !== 'string') return 0;
  const cleanedValue = value
    .replace("R$", "")
    .trim()
    .replace(/\./g, "")
    .replace(",", ".");
  return parseFloat(cleanedValue) || 0;
};

const IndexPage = () => {
  const [data, setData] = useState<SiengeData[]>([]);
  const [fileName, setFileName] = useState<string>("");

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ";",
      complete: (results) => {
        if (results.errors.length > 0) {
          showError("Erro ao processar o arquivo CSV. Verifique o formato.");
          console.error("CSV Errors:", results.errors);
          return;
        }
        
        const mappedData = results.data.map((row: any) => {
          const newRow: Partial<SiengeData> = {};
          for (const key in row) {
            if (COLUMN_MAPPING[key]) {
              const newKey = COLUMN_MAPPING[key];
              if (newKey === 'value') {
                (newRow as any)[newKey] = parseValue(row[key]);
              } else {
                (newRow as any)[newKey] = row[key];
              }
            }
          }
          return newRow as SiengeData;
        }).filter(row => row.requestNumber); // Filtra linhas que possam estar vazias

        setData(mappedData);
      },
      error: (error) => {
        showError("Ocorreu um erro inesperado ao ler o arquivo.");
        console.error("PapaParse Error:", error);
      }
    });
  };

  const handleReset = () => {
    setData([]);
    setFileName("");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {data.length === 0 ? (
          <FileUpload onFileUpload={handleFileUpload} />
        ) : (
          <Dashboard data={data} fileName={fileName} onReset={handleReset} />
        )}
      </main>
      <Footer />
      <Toaster theme="dark" />
    </div>
  );
};

export default IndexPage;