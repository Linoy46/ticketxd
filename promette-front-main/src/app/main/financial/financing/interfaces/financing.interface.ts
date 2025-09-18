/**
 * @file financing.interface.ts
 * @description Interfaces para la gestión de financiamiento
 */

import { User, Area } from '../../budgets/interfaces/budgets.interface';

/**
 * Interfaz para items de financiamiento
 */
export interface FinancingItem {
  id_financiamiento?: number;
  nombre_financiamiento: string;
  estado: number;
}
export interface FinancingResponse {
  financiamientos: FinancingItem[];
  filtro_aplicado?: {
    puesto_id: number;
    financiamientos_filtrados: number[];
    total_registros: number;
    tipo_filtro?: string;
  };
}
export interface FinancingSingleResponse {
  financiamiento: FinancingItem;
}
export interface FinancingGenericResponse {
  msg: string;
  financiamiento?: FinancingItem;
}
export interface FinancingAssignment {
  id: number;
  financing_id: number;
  ct_area_id: number;
  amount: number;
  assigned_date: string;
  assigned_by: number;
  status: 'active' | 'inactive';
  area?: Area;
  user?: User;
  financing?: FinancingItem;
}
export interface FinancingRequest {
  id: number;
  ct_area_id: number;
  ct_usuario_id: number;
  amount: number;
  requested_date: string;
  justification: string;
  status: 'pending' | 'approved' | 'rejected';
  area?: Area;
  user?: User;
}
export interface FinancingBudget {
  id: number;
  name: string;
  fiscal_year: string;
  total_amount: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'closed' | 'planning';
  financing_sources: FinancingItem[];
}
