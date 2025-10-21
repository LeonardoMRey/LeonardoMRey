import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Demand, DemandStatus, DemandStatusEnum } from "@/types";
import KanbanColumn from "./KanbanColumn";
import { useState, useEffect } from "react";
import { showError, showSuccess } from "@/utils/toast";
import { DemandDetailsDialog } from "../demands/DemandDetailsDialog";

const fetchDemands = async (): Promise<Demand[]> => {
  const { data, error } = await supabase
    .from("demands")
    .select(`
      *,
      created_by_profile:profiles!demands_created_by_fkey(*),
      assigned_to_profile:profiles!demands_assigned_to_fkey(*)
    `);

  if (error) throw new Error(error.message);
  return data as Demand[];
};

const updateDemandStatus = async ({ id, status }: { id: number; status: DemandStatus }) => {
  const { error } = await supabase
    .from("demands")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(error.message);
};

const KanbanBoard = () => {
  const queryClient = useQueryClient();
  const { data: demands, isLoading, isError } = useQuery({
    queryKey: ["demands"],
    queryFn: fetchDemands,
  });

  const [columns, setColumns] = useState<Map<DemandStatus, Demand[]>>(new Map());
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);

  useEffect(() => {
    if (demands) {
      const newColumns = new Map<DemandStatus, Demand[]>();
      DemandStatusEnum.forEach(status => newColumns.set(status, []));
      demands.forEach(demand => {
        if (demand.status) {
          newColumns.get(demand.status)?.push(demand);
        }
      });
      setColumns(newColumns);
    }
  }, [demands]);

  const mutation = useMutation({
    mutationFn: updateDemandStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demands"] });
      showSuccess("Demanda movida com sucesso!");
    },
    onError: (error) => {
      showError(`Erro ao mover demanda: ${error.message}`);
    },
  });

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id;
    const overContainer = over.data.current?.sortable.containerId || over.id;

    if (active.data.current?.sortable.containerId !== overContainer) {
      mutation.mutate({ id: Number(activeId), status: overContainer as DemandStatus });
    }
  };

  if (isLoading) return <div>Carregando quadro...</div>;
  if (isError) return <div>Ocorreu um erro ao buscar as demandas.</div>;

  return (
    <>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex space-x-4 overflow-x-auto p-4">
          <SortableContext items={Array.from(columns.keys())}>
            {Array.from(columns.entries()).map(([status, demandsInColumn]) => (
              <KanbanColumn 
                key={status} 
                status={status} 
                demands={demandsInColumn}
                onCardClick={setSelectedDemand}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>
      {selectedDemand && (
        <DemandDetailsDialog
          demand={selectedDemand}
          open={!!selectedDemand}
          onOpenChange={() => setSelectedDemand(null)}
        />
      )}
    </>
  );
};

export default KanbanBoard;