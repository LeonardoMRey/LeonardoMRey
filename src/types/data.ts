export interface Demanda {
  requestNumber: string; // Nº da Solicitação
  itemDescription: string; // Descrição do insumo
  requestStatus: string; // Situação da solicitação
  requestDate: string; // Data da solicitação
  buyer: string; // Comprador (Comprador distribuído)
  project: string; // Obra
  authorization: string; // Situação autorização do item
  
  // Campos de Pedido/Compra
  orderNumber?: string; // N° do Pedido
  supplier?: string; // Fornecedor
  deliveryStatus?: string; // Situação do pedido (Entrega)
  netValue?: number; // Valor líquido entrega (Não existe no novo relatório, mas mantemos para compatibilidade futura ou usaremos Valor da nota)
  deliveryDate?: string; // Previsão de entrega
  
  // Campos de Quantidade (Baseados no novo relatório)
  requestedQuantity: number; // Quantidade solicitada
  deliveredQuantity?: number; // Quantidade entregue
  pendingQuantity?: number; // Saldo (Quant. pendente)
}

// Exportamos Demanda como o tipo principal
export type Solicitacao = Demanda;
export type Compra = Demanda;