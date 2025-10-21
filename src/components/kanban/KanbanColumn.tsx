import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { Demand, DemandStatus } from "@/types";
import KanbanCard from "./KanbanCard";
import { useMemo } from "react";

type KanbanColumnProps = {
  status: DemandStatus;
  demands: Demand[];
  onCardClick: (demand: Demand) => void;
};

const KanbanColumn = ({ status, demands, onCardClick }: KanbanColumnProps) => {
  const { setNodeRef } = useSortable({ id: status });
  const demandIds = useMemo(() => demands.map((d) => d.id), [demands]);

  return (
    <div
      ref={setNodeRef}
      className="w-full md:w-1/4 lg:w-1/5 flex-shrink-0 bg-gray-100 rounded-lg p-4"
    >
      <h3 className="text-lg font-semibold mb-4 text-graphite-gray border-b-2 border-matte-gold pb-2">
        {status} ({demands.length})
      </h3>
      <div className="h-full overflow-y-auto">
        <SortableContext items={demandIds}>
          {demands.map((demand) => (
            <KanbanCard key={demand.id} demand={demand} onCardClick={onCardClick} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export default KanbanColumn;