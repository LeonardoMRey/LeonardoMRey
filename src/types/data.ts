export interface DemandaConsolidada {
  requestNumber: string; // Nº da Solicitação
  itemDescription: string; // Descrição do insumo
  requestStatus: string; // Situação da solicitação
  requestDate: string; // Data da solicitação
  
  // Usaremos 'buyer' como Comprador e Solicitante (proxy)
  buyer: string; // Comprador distribuído
  
  project: string; // Obra
  authorizationStatus: string; // Situação autorização do item
  
  orderNumber: string; // N° do Pedido
  supplier: string; // Fornecedor
  orderStatus: string; // Situação do pedido
  deliveryForecast: string; // Previsão de entrega
  
  requestedQuantity: number; // Quantidade solicitada
  deliveredQuantity: number; // Quantidade entregue
  pendingQuantity: number; // Saldo
  invoiceValue: number; // Valor da nota
  
  orderDate?: string; // Data do pedido
  actualDeliveryDate?: string; // Data entrega na obra
}