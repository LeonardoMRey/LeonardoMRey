export interface Solicitacao {
  requestNumber: string;
  itemDescription: string;
  status: string;
  deliveryDate: string;
  buyer: string;
  project: string;
  pendingQuantity: number;
  attendedQuantity: number;
  requestDate: string;
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