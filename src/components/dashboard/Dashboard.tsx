import { useMemo, useState } from "react";
import { SiengeData } from "@/types/sienge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, RefreshCw } from "lucide-react";
import { StageBarChart } from "../charts/StageBarChart";
import { StatusPieChart } from "../charts/StatusPieChart";
import { TimelineLineChart } from "../charts/TimelineLineChart";

interface DashboardProps {
  data: SiengeData[];
  fileName: string;
  onReset: () => void;
}

export const Dashboard = ({ data, fileName, onReset }: DashboardProps) => {
  const [responsibleFilter, setResponsibleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("");

  const { totalValue, uniqueResponsibles, uniqueStatuses } = useMemo(() => {
    const responsibles = new Set<string>();
    const statuses = new Set<string>();
    let total = 0;

    data.forEach(item => {
      total += item.value;
      if (item.responsible) responsibles.add(item.responsible);
      if (item.status) statuses.add(item.status);
    });

    return {
      totalValue: total,
      uniqueResponsibles: ["all", ...Array.from(responsibles)],
      uniqueStatuses: ["all", ...Array.from(statuses)],
    };
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const responsibleMatch = responsibleFilter === "all" || item.responsible === responsibleFilter;
      const statusMatch = statusFilter === "all" || item.status === statusFilter;
      const supplierMatch = !supplierFilter || item.supplier?.toLowerCase().includes(supplierFilter.toLowerCase());
      return responsibleMatch && statusMatch && supplierMatch;
    });
  }, [data, responsibleFilter, statusFilter, supplierFilter]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileText className="text-accent" />
          <span className="font-medium">{fileName}</span>
        </div>
        <Button onClick={onReset} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Carregar Novo Arquivo
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total das Solicitações</CardTitle>
            <span className="text-2xl text-accent">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </CardContent>
        </Card>
        <div className="lg:col-span-3">
          <TimelineLineChart data={data} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <StageBarChart data={data} />
        <StatusPieChart data={data} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes das Solicitações</CardTitle>
          <div className="mt-4 flex flex-col md:flex-row gap-4">
            <Select value={responsibleFilter} onValueChange={setResponsibleFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por Responsável" />
              </SelectTrigger>
              <SelectContent>
                {uniqueResponsibles.map(r => <SelectItem key={r} value={r}>{r === 'all' ? 'Todos Responsáveis' : r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por Status" />
              </SelectTrigger>
              <SelectContent>
                {uniqueStatuses.map(s => <SelectItem key={s} value={s}>{s === 'all' ? 'Todos Status' : s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input
              placeholder="Filtrar por Fornecedor..."
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="w-full md:w-[240px]"
            />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Solicitação</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item, index) => (
                  <TableRow key={`${item.requestNumber}-${index}`}>
                    <TableCell>{item.requestNumber}</TableCell>
                    <TableCell>{item.requestDate}</TableCell>
                    <TableCell>{item.responsible}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell className="text-right">
                      {item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};