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
  dateRange, setDateRange, project, setProject, buyer, setBuyer, projectOptions, buyerOptions, clearFilters,
}: DashboardFiltersProps) => {
  const hasActiveFilters = dateRange || project || buyer;

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button id="date" variant={"outline"} className={cn("w-[260px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (dateRange.to ? (<>{format(dateRange.from, "dd/MM/y", { locale: ptBR })} - {format(dateRange.to, "dd/MM/y", { locale: ptBR })}</>) : (format(dateRange.from, "dd/MM/y", { locale: ptBR }))) : (<span>Período</span>)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn("w-auto p-0", "light-theme-popover")} align="end">
          <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={ptBR} />
        </PopoverContent>
      </Popover>

      <Select value={project} onValueChange={setProject}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Obra" />
        </SelectTrigger>
        <SelectContent className="light-theme-popover">
          <SelectItem value="all">Todas as Obras</SelectItem>
          {projectOptions.map((opt) => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}
        </SelectContent>
      </Select>

      <Select value={buyer} onValueChange={setBuyer}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Comprador" />
        </SelectTrigger>
        <SelectContent className="light-theme-popover">
          <SelectItem value="all">Todos os Compradores</SelectItem>
          {buyerOptions.map((opt) => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
          <X className="mr-2 h-4 w-4" /> Limpar
        </Button>
      )}
    </div>
  );
};