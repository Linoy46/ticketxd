export type { ColDef, GridApi } from 'ag-grid-community';
export interface FundingSource {
  id: number;
  description: string;
  type: string;
  amount: number;
  status: 'active' | 'inactive' | 'pending' | string;
}
export interface Budget {
  id: number;
  name: string;
  fiscalYear: string;
  totalAmount: number;
  assignedAmount: number;
  remainingAmount: number;
  status: 'active' | 'inactive' | 'pending' | string;
  fundingSources?: FundingSource[];
}

/**
 * Interfaz para departamentos del sistema
 */
export interface Department {
  id_departamento: number;
  nombre_departamento: string;
  estado: number;
}

/**
 * Interfaz para áreas administrativas
 */
export interface Area {
  id_area: number; // ID del área de infraestructura (API externa)
  id_area_fin: number; // ID del área financiera (rl_area_financiero.id_area_fin)
  id_financiero?: number; // ID financiero para mostrar
  id_area_infra: number; // ID de vinculación con API externa
  nombre_area: string; // Nombre del área obtenido de la API de infraestructura
  nombre?: string; // Alias para compatibilidad
  clave_area?: string;
  estado?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interfaz para usuarios del sistema
 */
export interface User {
  id_usuario: number;
  nombre_usuario: string;
  correo?: string;
  estado?: number;
  rol?: string;
}

/**
 * Interfaz para capítulos de presupuesto
 */
export interface Chapter {
  id_capitulo: number;
  clave_capitulo: string;
  nombre_capitulo: string;
  estado: number;
  partidas?: Item[]; // Relación con partidas
}

/**
 * Interfaz para partidas presupuestales
 */
export interface Item {
  id_partida: number;
  clave_partida: string;
  nombre_partida: string;
  estado?: number;
}

/**
 * Interfaz para productos consumibles
 */
export interface ConsumableProduct {
  id_producto: number;
  nombre_producto: string;
  descripcion?: string;
  marca?: string;
  modelo?: string;
  precio: number;
  ct_partida_id: number;
  estado?: number;
  // Relación con partida
  ct_partida?: Item;
  clave_partida?: string;
  nombre_partida?: string;
}

/**
 * Interfaz para fuentes de financiamiento alineada con el modelo de backend
 */
export interface Financiamiento {
  id_financiamiento: number;
  nombre_financiamiento: string;
  descripcion?: string;
  estado?: number;
}

/**
 * Interfaz para techos presupuestales alineada con dt_techo_presupuesto
 */
export interface BudgetCeiling {
  id_techo: number;
  ct_area_id: number;
  ct_capitulo_id: number;
  ct_financiamiento_id: number;
  cantidad_presupuestada: number;
  ct_usuario_in: number;
  ct_usuario_at?: number;
  createdAt?: Date;
  updatedAt?: Date;

  // Campos relacionados (objetos completos)
  ct_area?: Area;
  ct_capitulo?: Chapter;
  ct_financiamiento?: Financiamiento;
  ct_usuario_in_ct_usuario?: User;
  ct_usuario_at_ct_usuario?: User;

  // Campos para compatibilidad con el código existente
  cantidad_mac?: number;
  cantidad_estatal?: number;
  cantidad_fone?: number;

  // Relaciones con otras tablas
  dt_proyecto_anuals?: ProyectoAnual[];
  rl_producto_requisicions?: RequisicionProducto[];
}

/**
 * Interfaz para proyectos anuales alineada con dt_proyecto_anual
 */
export interface ProyectoAnual {
  id_proyecto_anual: number;
  año: number;
  dt_techo_id: number;
  monto_asignado: number;
  monto_utilizado: number;
  monto_disponible: number;
  descripcion?: string;
  estado: number;
  createdAt: Date;
  updatedAt: Date;
  dt_techo?: {
    id_techo: number;
    ct_area_id: number; // Este campo apunta a rl_area_financiero.id_area_fin
    ct_capitulo_id: number;
    ct_financiamiento_id: number;
    cantidad_presupuestada: number;

    // RELACIÓN: dt_techo.ct_area_id -> rl_area_financiero.id_area_fin
    rl_area_financiero?: {
      id_area_fin: number; //  Primary key
      id_area_infra: number; //  Para API externa
      id_financiero: number; // INFORMATIVO
      nombre?: string; // Nombre obtenido de API de infraestructura
      ct_area?: {
        id_area: number;
        nombre_area: string; // Nombre de la API externa (puede ser incorrecto)
      };
    };

    ct_capitulo?: {
      id_capitulo: number;
      nombre_capitulo: string;
      clave_capitulo: string;
    };

    ct_financiamiento?: {
      id_financiamiento: number;
      nombre_financiamiento: string;
    };
  };
}

/**
 * Interfaz para requisiciones de productos alineada con rl_producto_requisicion
 */
export interface RequisicionProducto {
  id_producto_requisicion: number;
  ct_area_id: number; //  ID del área financiera (rl_area_financiero.id_area_fin)
  dt_techo_id: number; // ID del techo presupuestal
  ct_productos_id: number; // ID del producto
  cantidad: number;
  mes: string; // Mes de la requisición
  total: number; // Total calculado (cantidad * precio)
  ct_usuarios_in: number; // Usuario que crea
  ct_usuarios_at?: number; // Usuario que modifica
  createdAt: Date;
  updatedAt: Date;

  // Relaciones
  ct_producto?: ConsumableProduct;
  dt_techo?: ProyectoAnual['dt_techo'];
  ct_area?: Area; // Área financiera completa
  ct_usuarios_in_ct_usuario?: {
    id_usuario: number;
    nombre_usuario: string;
  };
}

/**
 * Interfaz para justificaciones alineada con rl_justificacion
 */
export interface Justificacion {
  id_justificacion: number;
  ct_partida_id: number;
  ct_area_id: number; //FUNCIONAL - ID del área financiera (rl_area_financiero.id_area_fin)
  justificacion: string;
  ct_usuario_id?: number;
  createdAt?: Date;
  updatedAt?: Date;

  // Relaciones con otras tablas
  ct_area?: Area;
  ct_partida?: Item;
  ct_usuario?: User;
}

/**
 * Interfaz simplificada para BudgetItem (vista de presupuestos)
 */
export interface BudgetItem {
  idTecho: number; // ✅ PROPIEDAD PRINCIPAL
  unidad: string;
  areaId: number;
  areaInfraId?: number;
  idFinanciero?: number;
  fuente: string;
  capitulo: string;
  presupuestado: number;
  utilizado: number;
  disponible: number;
  porcentajeUtilizado: number;

  // ✅ AÑADIR: Propiedades alternativas para compatibilidad
  id_techo?: number; // Propiedad alternativa desde base de datos
  techo_id?: number; // Otra posible propiedad alternativa
  techoId?: number; // Otra posible propiedad alternativa

  // ✅ ÍNDICE DINÁMICO para permitir acceso a propiedades no definidas
  [key: string]: any;
}
/**
 * Representa una unidad administrativa para filtros
 * @interface UnidadAdministrativa
 * @property {string} id - Identificador de la unidad administrativa
 * @property {string} nombre - Nombre de la unidad administrativa
 */
export interface UnidadAdministrativa {
  id: string;
  nombre: string;
}

/**
 * Representa una fuente de financiamiento para filtros
 * @interface FuenteFinanciamiento
 * @property {string} id - Identificador de la fuente de financiamiento
 * @property {string} nombre - Nombre de la fuente de financiamiento
 */
export interface FuenteFinanciamiento {
  id: string;
  nombre: string;
}

/**
 * Interfaces para solicitudes a la API
 */
export interface BudgetCeilingCreateRequest {
  ct_area_id: number;
  ct_capitulo_id: number;
  ct_financiamiento_id: number;
  cantidad_presupuestada: number;
  ct_usuario_in: number;
}

export interface BudgetCeilingUpdateRequest {
  id_techo: number;
  ct_area_id?: number;
  ct_capitulo_id?: number;
  ct_financiamiento_id?: number;
  cantidad_presupuestada?: number;
  ct_usuario_at?: number;
}

/**
 * Interfaces para consultas específicas de techos presupuestales por área
 */
export interface BudgetCeilingByAreaRequest {
  ct_area_id: number;
}

export interface BudgetCeilingByAreaResponse {
  techo: BudgetCeiling;
  capitulos: Chapter[];
}

/**
 * Interfaces para consultas de partidas por capítulo
 */
export interface PartidaByCapituloRequest {
  ct_capitulo_id: number;
}

export interface PartidaByCapituloResponse {
  partidas: Item[];
}

/**
 * Interfaces para consultas de productos por partida
 */
export interface ProductosByPartidaRequest {
  ct_partida_id: number;
}

export interface ProductosByPartidaResponse {
  productos: ConsumableProduct[];
}

/**
 * Interfaces para consultas de justificaciones
 */
export interface JustificacionCreateRequest {
  ct_partida_id: number;
  ct_area_id: number;
  justificacion: string;
  ct_usuario_id: number;
}

export interface JustificacionUpdateRequest {
  id_justificacion: number;
  ct_partida_id?: number;
  ct_area_id?: number;
  justificacion?: string;
  ct_usuario_id?: number;
}

/**
 * Interfaces para consultas de proyectos anuales
 */
export interface ProyectoAnualCreateRequest {
  año: number;
  dt_techo_id: number;
  monto_asignado: number;
  monto_utilizado?: number;
  monto_disponible?: number;
  descripcion?: string;
  estado?: number;
}

export interface ProyectoAnualUpdateRequest {
  id_proyecto_anual: number;
  año?: number;
  dt_techo_id?: number;
  monto_asignado?: number;
  monto_utilizado?: number;
  monto_disponible?: number;
  descripcion?: string;
  estado?: number;
}

/**
 * Interfaces para consultas de requisiciones
 */
export interface RequisicionProductoCreateRequest {
  ct_area_id: number;
  dt_techo_id: number;
  ct_productos_id: number;
  cantidad: number;
  mes: string;
  ct_usuarios_in: number;
  ct_usuarios_at?: number;
}

export interface RequisicionProductoUpdateRequest {
  id_producto_requisicion: number;
  ct_area_id?: number;
  dt_techo_id?: number;
  ct_productos_id?: number;
  cantidad?: number;
  mes?: string;
  ct_usuarios_at?: number;
}

/**
 * Interfaz genérica para respuestas de la API
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;

  // Campos específicos usados por diferentes endpoints
  budget?: Budget;
  ceiling?: BudgetCeiling;
  ceilings?: BudgetCeiling[];
  project?: ProyectoAnual;
  projects?: ProyectoAnual[];
  requisition?: RequisicionProducto;
  requisitions?: RequisicionProducto[];
  justificacion?: Justificacion;
  justificaciones?: Justificacion[];
  products?: ConsumableProduct[];
  items?: Item[];
  areas?: Area[];
  chapters?: Chapter[];

  // Campos para totales presupuestales
  totals?: any;
  grandTotal?: number;
  areaSummary?: any;
}

// Interfaz para crear requisiciones
export interface CreateRequisitionRequest {
  dt_techo_id: number | null; // ID del techo presupuestal
  ct_area_id: number; // FUNCIONAL - ID del área financiera (rl_area_financiero.id_area_fin)
  ct_usuario_id: number; // ID del usuario que crea
  justificacion?: string; // Justificación general
  descripcion?: string; // Descripción del proyecto
  selectedProducts: {
    product: ConsumableProduct;
    monthlyQuantities: {
      mes: number;
      nombre: string;
      cantidad: number;
    }[];
    totalQuantity: number;
  }[];
}

// ✅ AÑADIR: Interfaz para el formato que espera el backend
export interface BackendRequisitionRequest {
  dt_techo_id: number | null;
  ct_area_id: number;
  ct_usuario_id: number;
  justificacion?: string;
  descripcion?: string;
  productos: {
    ct_productos_id: number;
    meses: {
      mes: number;
      cantidad: number;
    }[];
  }[];
}

// ✅ AÑADIR: Interfaz para crear proyecto anual
export interface CreateProyectoAnualRequest {
  año: number;
  dt_techo_id: number; // ID del techo presupuestal
  descripcion?: string;
  monto_asignado?: number; //
  monto_utilizado?: number; //
  estado?: number; //
}

export interface UpdateProyectoAnualRequest {
  id_proyecto_anual: number;
  monto_utilizado?: number; // Para actualizar cuando se crean requisiciones
  descripcion?: string;
  estado?: number;
}
export interface RequisitionResponse extends ApiResponseBase {
  success: boolean;
  msg: string;
  requisiciones: number; // Número de requisiciones creadas
  proyecto_anual?: ProyectoAnual; // Proyecto anual actualizado
  justificaciones?: number; // Número de justificaciones creadas
}
export interface ProyectoAnualResponse extends ApiResponseBase {
  success: boolean;
  msg: string;
  project?: ProyectoAnual;
  projects?: ProyectoAnual[];
}

// ✅ CORRECCIÓN: Renombrar ProyectoAnual a ProjectAnnual para consistencia
export interface ProjectAnnual {
  id_proyecto_anual: number;
  año: number;
  dt_techo_id: number; // ID del techo presupuestal
  monto_asignado: number;
  monto_utilizado: number;
  monto_disponible: number;
  descripcion?: string;
  estado: number;
  createdAt: Date;
  updatedAt: Date;

  // ✅ RELACIÓN CORRECTA: dt_techo apunta a rl_area_financiero por ct_area_id
  dt_techo?: {
    id_techo?: number;
    ct_area_id?: number; // ✅ Este campo apunta a rl_area_financiero.id_area_fin
    ct_capitulo_id?: number;
    ct_financiamiento_id?: number;
    cantidad_presupuestada?: number;

    // ✅ RELACIÓN: dt_techo.ct_area_id -> rl_area_financiero.id_area_fin
    rl_area_financiero?: {
      id_area_fin?: number; // ✅ FUNCIONAL - Primary key
      id_area_infra?: number; // ✅ VINCULACIÓN - Para API externa
      id_financiero?: number; // ✅ INFORMATIVO
      nombre?: string; // ✅ Nombre obtenido de API de infraestructura
      ct_area?: {
        id_area?: number;
        nombre_area?: string;
      };
    };

    ct_capitulo?: {
      id_capitulo?: number;
      nombre_capitulo?: string;
      clave_capitulo?: string;
    };

    ct_financiamiento?: {
      id_financiamiento?: number;
      nombre_financiamiento?: string;
    };
  };
}

// ✅ CORRECCIÓN: Justificación con área financiera correcta
export interface JustificacionPartida {
  id_justificacion?: number;
  ct_partida_id: number; // ID de la partida
  ct_area_id: number; // ✅ FUNCIONAL - ID del área financiera (rl_area_financiero.id_area_fin)
  justificacion: string; // Texto de la justificación
  ct_usuario_in: number; // Usuario que crea
  ct_usuario_at?: number; // Usuario que modifica
  createdAt?: Date;
  updatedAt?: Date;
}

// ✅ CORRECCIÓN: Requisición con área financiera correcta
export interface ProductRequisition {
  id_producto_requisicion: number;
  ct_area_id: number; // ✅ FUNCIONAL - ID del área financiera (rl_area_financiero.id_area_fin)
  dt_techo_id: number; // ID del techo presupuestal
  ct_productos_id: number; // ID del producto
  cantidad: number;
  mes: string; // Mes de la requisición
  total: number; // Total calculado (cantidad * precio)
  ct_usuarios_in: number; // Usuario que crea
  ct_usuarios_at?: number; // Usuario que modifica
  createdAt: Date;
  updatedAt: Date;

  // Relaciones
  ct_producto?: ConsumableProduct;
  dt_techo?: ProyectoAnual['dt_techo'];
  ct_area?: Area; // ✅ Área financiera completa
  ct_usuarios_in_ct_usuario?: {
    id_usuario: number;
    nombre_usuario: string;
  };
}

// ✅ RESPUESTAS API GENÉRICAS
export interface ApiResponseBase {
  success: boolean;
  msg: string;
  [key: string]: any;
}
