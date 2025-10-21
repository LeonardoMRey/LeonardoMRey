import { useState } from "react";
import Papa from "papaparse";
import { Solicitacao, Compra } from "@/types/data";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FileUpload } from "@/components/dashboard/FileUpload";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Toaster } from "@/components/ui/sonner";
import { showError } from "@/utils/toast";

// Mapeamento para o Relatório de Solicitações
const SOLICITACAO_MAPPING: { [key: string]: keyof Solicitacao } = {
  "Nº da solicitação": "requestNumber",
  "Descrição insumo": "itemDescription",
  "Situação": "status",
  "Data previsão": "deliveryDate",
  "Comprador": "buyer", // Mapeado como Responsável
  "Obra": "project", // Mapeado como Setor
  "Quant. pendente": "pendingQuantity",
  "Quant. atendida": "attendedQuantity",
  "Data solicitação": "requestDate",
  "Nº do pedido vinculado": "linkedOrderNumber", // Novo campo assumido
};

// Mapeamento para o Relatório de Compras
const COMPRA_MAPPING: { [key: string]: keyof Compra } = {
  "Nº do pedido": "orderNumber",
  "Obra": "project",
  "Comprador": "buyer",
  "Fornecedor": "supplier",
  "Status entrega": "deliveryStatus",
  "Valor líquido entrega": "netValue",
  "Data prevista": "deliveryDate",
  "Quant. pendente": "pendingQuantity",
  "Quant. entregue": "deliveredQuantity",
};

const parseNumber = (value: string): number => {
  if (!value || typeof value !== 'string') return 0;
  const cleanedValue = value.replace("R$", "").trim().replace(/\./g, "").replace(",", ".");
  const num = parseFloat(cleanedValue);
  return isNaN(num) ? 0 : num;
};

const IndexPage = () => {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [solicitacoesFile, setSolicitacoesFile] = useState<string>("");
  const [comprasFile, setComprasFile] = useState<string>("");

  const handleFileUpload = (file: File, type: 'solicitacoes' | 'compras') => {
    const mapping = type === 'solicitacoes' ? SOLICITACAO_MAPPING : COMPRA_MAPPING;
    const numberFields = type === 'solicitacoes' 
      ? ['pendingQuantity', 'attendedQuantity'] 
      : ['netValue', 'pendingQuantity', 'deliveredQuantity'];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ";",
      trimHeaders: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          showError(`Erro ao processar o arquivo de ${type}. Verifique o formato.`);
          console.error("CSV Errors:", results.errors);
          return;
        }
        
        const mappedData = results.data.map((row: any) => {
          const newRow: Partial<Solicitacao & Compra> = {};
          for (const key in row) {
            if (mapping[key]) {
              const newKey = mapping[key];
              if (numberFields.includes(newKey)) {
                (newRow as any)[newKey] = parseNumber(row[key]);
              } else {
                (newRow as any)[newKey] = row[key];
              }
            }
          }
          return newRow;
        }).filter(row => Object.keys(row).length > 2);

        if (type === 'solicitacoes') {
          setSolicitacoes(mappedData as Solicitacao[]);
          setSolicitacoesFile(file.name);
        } else {
          setCompras(mappedData as Compra[]);
          setComprasFile(file.name);
        }
      },
      error: (error) => {
        showError("Ocorreu um erro inesperado ao ler o arquivo.");
        console.error("PapaParse Error:", error);
      }
    });
  };

  const handleReset = () => {
    setSolicitacoes([]);
    setCompras([]);
    setSolicitacoesFile("");
    setComprasFile("");
  };

  const showDashboard = solicitacoes.length > 0 && compras.length > 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {showDashboard ? (
          <Dashboard solicitacoesData={solicitacoes} comprasData={compras} onReset={handleReset} />
        ) : (
          <div className="grid md:grid-cols-2 gap-8 mt-10">
            <FileUpload 
              onFileUpload={(file) => handleFileUpload(file, 'solicitacoes')} 
              title="Relatório de Solicitações (Requisições Internas)"
              fileName={solicitacoesFile}
            />
            <FileUpload 
              onFileUpload={(file) => handleFileUpload(file, 'compras')} 
              title="Relatório de Pedidos de Compras (Pedidos Emitidos)"
              fileName={comprasFile}
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