import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardFiltersProps {
  dateRange: DateRange | undefined;
  setDateRange: (date: DateRange | undefined) => void;
  project: string;
  setProject: (project: string) => void;
  buyer: string;
  setBuyer: (buyer: string) => void;
  projectOptions: string[];
  buyerOptions: string[];
  clearFilters: () => void;
}

export const DashboardFilters = ({
  dateRange,
  setDateRange,
  project,
  setProject,
  buyer,
  setBuyer,
  projectOptions,
  buyerOptions,
  clearFilters,
}: DashboardFiltersProps) => {
  const hasActiveFilters = dateRange || project || buyer;

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 p-4 border rounded-lg bg-card mb-6">
      <h3 className="text-lg font-semibold text-foreground hidden lg:block">Filtros:</h3>
      
      {/* Date Range Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full md:w-[300px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd/MM/y", { locale: ptBR })} -{" "}
                  {format(dateRange.to, "dd/MM/y", { locale: ptBR })}
                </>
              ) : (
                format(dateRange.from, "dd/MM/y", { locale: ptBR })
              )
            ) : (
              <span>Selecione um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>

      {/* Project Filter */}
      <Select value={project} onValueChange={setProject}>
        <SelectTrigger className="w-full md:w-[250px]">
          <SelectValue placeholder="Filtrar por Obra" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as Obras</SelectItem>
          {projectOptions.map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Buyer Filter */}
      <Select value={buyer} onValueChange={setBuyer}>
        <SelectTrigger className="w-full md:w-[250px]">
          <SelectValue placeholder="Filtrar por Comprador" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Compradores</SelectItem>
          {buyerOptions.map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
          <X className="mr-2 h-4 w-4" />
          Limpar Filtros
        </Button>
      )}
    </div>
  );
};