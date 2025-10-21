import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Demanda } from '@/types/data';
import { showSuccess, showError } from '@/utils/toast';

type ExportableData = Demanda[];

interface ExportOptions {
  title: string;
  headers: string[];
  keys: (keyof Demanda)[];
}

export const useExport = () => {

  const exportToCSV = (data: ExportableData, filename: string, options: ExportOptions) => {
    try {
      const csvData = [
        options.headers.join(';'),
        ...data.map(row => 
          options.keys.map(key => {
            let value = row[key];
            if (typeof value === 'number') {
              // Formata números para o padrão brasileiro (vírgula como separador decimal)
              value = value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
            return `"${value}"`;
          }).join(';')
        )
      ].join('\n');

      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccess(`Relatório "${filename}" exportado para CSV com sucesso!`);
    } catch (error) {
      console.error("Export CSV Error:", error);
      showError("Erro ao exportar para CSV.");
    }
  };

  const exportToPDF = (data: ExportableData, filename: string, options: ExportOptions) => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const body = data.map(row => 
        options.keys.map(key => {
          let value = row[key];
          if (typeof value === 'number') {
            value = value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          }
          return String(value || '');
        })
      );

      (doc as any).autoTable({
        head: [options.headers],
        body: body,
        startY: 10,
        styles: { fontSize: 8, cellPadding: 1.5 },
        headStyles: { fillColor: [33, 150, 243], textColor: 255 }, // Azul primário
        margin: { top: 10, left: 5, right: 5, bottom: 5 },
      });

      doc.save(`${filename}.pdf`);
      showSuccess(`Relatório "${filename}" exportado para PDF com sucesso!`);
    } catch (error) {
      console.error("Export PDF Error:", error);
      showError("Erro ao exportar para PDF.");
    }
  };

  return { exportToCSV, exportToPDF };
};