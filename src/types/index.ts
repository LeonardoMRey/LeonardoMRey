import { Database } from "./database.types";

export type Demand = Database['public']['Tables']['demands']['Row'] & {
  created_by_profile: Profile | null;
  assigned_to_profile: Profile | null;
};

export type Profile = Database['public']['Tables']['profiles']['Row'];

export const DemandStatusEnum = [
  'Solicitado',
  'Análise Crítica',
  'Cotação',
  'Análise Comparativa',
  'Estimativa de Custos',
  'Revisão Crítica',
  'Aprovação Final',
  'Concluído'
] as const;

export type DemandStatus = typeof DemandStatusEnum[number];