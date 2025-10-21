import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Demand } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "../ui/badge";

type KanbanCardProps = {
  demand: Demand;
  onCardClick: (demand: Demand) => void;
};

const KanbanCard = ({ demand, onCardClick }: KanbanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: demand.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const assignedTo = demand.assigned_to_profile;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card 
        className="mb-4 bg-off-white border-matte-gold/20 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => onCardClick(demand)}
      >
        <CardHeader className="p-4">
          <CardTitle className="text-base text-petrol-blue">{demand.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex justify-between items-center">
          <div>
            {demand.urgency && <Badge variant="outline">{demand.urgency}</Badge>}
          </div>
          <Avatar className="h-8 w-8">
            <AvatarImage src={assignedTo?.avatar_url || ''} alt={assignedTo?.full_name || 'N/A'} />
            <AvatarFallback>
              {assignedTo?.full_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
        </CardContent>
      </Card>
    </div>
  );
};

export default KanbanCard;