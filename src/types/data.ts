export interface Solicitacao {
  requestNumber: string;
  itemDescription: string;
  status: string;
  deliveryDate: string;
  buyer: string; // Responsável/Comprador
  project: string; // Setor/Obra
  pendingQuantity: number;
  attendedQuantity: number;
  requestDate: string;
  linkedOrderNumber?: string; // Novo campo para vincular ao Pedido
  authorization?: string; // Novo campo para Autorização (Sim/Não)
}

export interface Compra {
  orderNumber: string;
  project: string;
  buyer: string;
  supplier: string;
  deliveryStatus: string;
  netValue: number;
  deliveryDate: string;
  pendingQuantity: number;
  deliveredQuantity: number;
}