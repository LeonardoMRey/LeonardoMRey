import { useState, useMemo } from "react";
import { EficienciaComprasDashboard } from "@/components/dashboards/EficienciaComprasDashboard";
import { useAllDemandas } from "@/components/layout/Layout";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { DateRange } from "react-day-picker";
import { parseDateString } from "@/utils/data-processing";
import { isWithinInterval } from "date-fns";

const EficienciaCompras = () => {
  const { demandas } = useAllDemandas();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedBuyer, setSelectedBuyer] = useState<string>("");

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
    <div className="flex flex-col gap-6">
      <DashboardFilters
        dateRange={dateRange} setDateRange={setDateRange}
        project={selectedProject} setProject={setSelectedProject}
        buyer={selectedBuyer} setBuyer={setSelectedBuyer}
        projectOptions={projectOptions} buyerOptions={buyerOptions}
        clearFilters={clearFilters}
      />
      <EficienciaComprasDashboard data={filteredDemandas} />
    </div>
  );
};

export default EficienciaCompras;