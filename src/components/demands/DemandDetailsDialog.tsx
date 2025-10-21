import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Demand } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User, Building } from "lucide-react";

type DemandDetailsDialogProps = {
  demand: Demand;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const DemandDetailsDialog = ({ demand, open, onOpenChange }: DemandDetailsDialogProps) => {
  const createdBy = demand.created_by_profile;
  const assignedTo = demand.assigned_to_profile;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-off-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-petrol-blue">{demand.title}</DialogTitle>
          <DialogDescription>
            Detalhes da solicitação de compra.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            {demand.status && <Badge>{demand.status}</Badge>}
            {demand.urgency && <Badge variant="outline">{demand.urgency}</Badge>}
          </div>
          {demand.description && (
            <div>
              <h4 className="font-semibold text-graphite-gray mb-1">Descrição</h4>
              <p className="text-sm text-gray-700 bg-white p-3 rounded-md border">{demand.description}</p>
            </div>
          )}
          {demand.cost_center && (
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-graphite-gray">Centro de Custo:</span>
              <span className="text-sm text-gray-700">{demand.cost_center}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t mt-2">
            <div>
              <h4 className="font-semibold text-graphite-gray mb-2">Criado por</h4>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={createdBy?.avatar_url || ''} alt={createdBy?.full_name || 'N/A'} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{createdBy?.full_name || 'Desconhecido'}</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-graphite-gray mb-2">Atribuído a</h4>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={assignedTo?.avatar_url || ''} alt={assignedTo?.full_name || 'N/A'} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{assignedTo?.full_name || 'Não atribuído'}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};