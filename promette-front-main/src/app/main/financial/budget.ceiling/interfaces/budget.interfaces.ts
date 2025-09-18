// Área de infraestructura (catálogo de la API de infraestructura)
export interface Area {
  id_area: number;
  nombre: string;
  clave_area?: string;
  estado?: number;
  id_financiero?: number;
  id_area_fin?: number;
  nombre_area?: string;
}

// Usuario básico (RUPEET o Promette)
export interface BasicUser {
  id_usuario: number;
  nombre_usuario: string;
}

// Capítulo presupuestal
export interface Capitulo {
  id_capitulo: number;
  clave_capitulo: number;
  nombre_capitulo: string;
  estado?: number;
}

// Financiamiento
export interface Financiamiento {
  id_financiamiento: number;
  nombre_financiamiento: string;
  estado?: number;
}

// Modelo de techo presupuestal (backend)
export interface BudgetCeiling {
  id_techo: number;
  ct_area_id: number; //
  ct_capitulo_id: number;
  ct_financiamiento_id: number;
  cantidad_presupuestada: number;
  ct_usuario_in: number;
  ct_usuario_at?: number;
  createdAt?: Date;
  updatedAt?: Date;

  // Relaciones backend
  ct_area?: {
    id_area_fin: number;
  };
  ct_capitulo?: Capitulo;
  ct_financiamiento?: Financiamiento;
  ct_usuario_in_ct_usuario?: BasicUser;
  ct_usuario_at_ct_usuario?: BasicUser;
}

// DTO para crear techo presupuestal
export interface CreateBudgetCeilingDto {
  ct_area_id: number;
  ct_capitulo_id: number;
  ct_financiamiento_id: number;
  cantidad_presupuestada: number;
  ct_usuario_in: number;
}

// DTO para actualizar techo presupuestal
export interface UpdateBudgetCeilingDto
  extends Omit<CreateBudgetCeilingDto, 'ct_usuario_in'> {
  id_techo?: number;
  ct_usuario_at: number;
}

// Respuestas API
export interface BudgetCeilingResponse {
  ceiling: BudgetCeiling;
}
export interface BudgetCeilingsResponse {
  ceilings: BudgetCeiling[];
}
export interface ApiResponse {
  msg: string;
  [key: string]: any;
}

// Operaciones del servicio (opcional)
export interface BudgetCeilingServiceOperations {
  getAll(): Promise<BudgetCeiling[]>;
  getById(id: number): Promise<BudgetCeiling>;
  create(data: CreateBudgetCeilingDto): Promise<BudgetCeiling>;
  update(id: number, data: UpdateBudgetCeilingDto): Promise<BudgetCeiling>;
  delete(id: number): Promise<boolean>;
}

// ViewModel para la tabla y UI
export interface BudgetCeilingViewModel {
  id: number;
  idFinanciero?: number;
  areaName: string; // nombre del área de infraestructura
  areaId: number;
  userName: string;
  capituloName: string;
  capituloId: number;
  financiamientoName: string;
  financiamientoId: number;
  presupuestado: number;
  createdBy: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  formattedPresupuesto?: string;
}
