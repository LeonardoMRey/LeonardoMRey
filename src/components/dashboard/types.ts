import { Demanda } from '@/types/data';

// DemandaProcessada é a Demanda base, não precisamos de SolicitacaoProcessada separada
export interface DemandaProcessada extends Demanda {
  isLinked: boolean; // Indica se a demanda tem um pedido vinculado (orderNumber preenchido)
}

export interface ProcessedData {
  demandas: DemandaProcessada[];
  // Não precisamos mais de listas separadas de solicitacoes e compras
}