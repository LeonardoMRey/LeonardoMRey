export interface Demanda {
  requestNumber: string; // Nº da solicitação
  itemDescription: string; // Descrição insumo
  requestStatus: string; // Situação
  requestDate: string; // Data solicitação
  buyer: string; // Comprador
  project: string; // Obra
  authorization: string; // Autorização (Sim/Não)
  
  // Campos de Pedido/Compra (podem ser nulos se não houver pedido)
  orderNumber?: string; // Nº do pedido
  supplier?: string; // Fornecedor
  deliveryStatus?: string; // Status entrega
  netValue?: number; // Valor líquido entrega
  deliveryDate?: string; // Data prevista (entrega)
  pendingQuantity?: number; // Quant. pendente (do pedido)
  deliveredQuantity?: number; // Quant. entregue (do pedido)
  
  // Campos de Solicitação (Quantidades)
  requestPendingQuantity: number; // Quant. pendente (da solicitação)
  requestAttendedQuantity: number; // Quant. atendida (da solicitação)
}

// Exportamos Demanda como o tipo principal
export type Solicitacao = Demanda;
export type Compra = Demanda;