import { Solicitacao, Compra } from '@/types/data';

// Estende Solicitacao para incluir o link processado
export interface SolicitacaoProcessada extends Solicitacao {
  linkedOrder?: Compra;
  isLinked: boolean;
}

export interface ProcessedData {
  solicitacoes: SolicitacaoProcessada[];
  compras: Compra[];
  comprasSemSolicitacao: Compra[];
}