/**
 * Interfaz para la respuesta del backend de entregas de consumibles
 */
export interface ConsumableDeliveryResponse {
  deliveries: BackendDelivery[];
  msg?: string;
}

/**
 * Interfaz para un objeto de inventario en la respuesta del backend
 */
export interface InventarioBackend {
  id_inventario?: number;
  folio?: string;
  descripcion?: string;
  description?: string;
  cantidad?: number;
  resta?: number;
  ct_partida_id?: number;
  ct_unidad_id?: number;
  ct_factura_id?: number;
  createdAt?: string;
  updatedAt?: string;
  ct_partida?: {
    id_partida?: number;
    clave?: string;
    clave_partida?: string;
    nombre?: string;
    nombre_partida?: string;
  };
}

/**
 * Interfaz para entrega de consumibles
 */
export interface EntregaConsumible {
  id_entrega: number;
  ct_departamento_id: number;
  dt_inventario_id: number;
  ct_unidad_id: number;
  cantidad: number;
  ct_usuario_id: number;
  folio?: string;
  folio_formato?: string | null;
  createdAt?: string;
  updatedAt?: string;

  // Relaciones
  ct_departamento?: {
    id_departamento: number;
    nombre_departamento: string;
    ct_direccion_id?: number;
    ct_direccion?: {
      id_direccion: number;
      nombre_direccion: string;
    };
  };
  dt_inventario?: InventarioBackend;
  unidad_medida?: {
    id_unidad: number;
    clave?: string;
    clave_unidad?: string;
    nombre_unidad?: string;
  };
  usuario_entrega?: {
    id_usuario: number;
    nombre_usuario: string;
  };
  formato?: EntregaFormato;
}

/**
 * Estructura de entrega de consumibles según el backend
 */
export interface BackendDelivery {
  id_entrega: number;
  ct_departamento_id: number;
  dt_inventario_id: number;
  ct_unidad_id: number;
  cantidad: number;
  ct_usuario_id: number;
  createdAt: string;
  updatedAt: string;
  folio?: string;
  folio_formato?: string | null;

  // Relaciones que vienen del backend
  ct_departamento?: {
    id_departamento: number;
    nombre_departamento: string;
    ct_direccion_id: number;
    ct_direccion?: {
      id_direccion: number;
      nombre_direccion: string;
    };
  };
  dt_inventario?: InventarioBackend;
  unidad_medida?: {
    id_unidad: number;
    clave?: string;
    clave_unidad?: string;
    nombre_unidad?: string;
  };
  usuario_entrega?: {
    id_usuario: number;
    nombre_usuario: string;
  };
  formato?: EntregaFormato;
}

/**
 * Interface para los datos de una salida histórica
 */
export interface SalidaHistorial {
  id: number;
  folio: string;
  fecha: string;
  departamento: string;
  id_departamento: number;
  cantidad: number;
  usuario: string;
  id_usuario: number;
  unidad: string;
  producto: {
    id: number;
    folio: string;
    descripcion: string;
    partida: string;
  };
  folio_formato?: string | null;
  detalles?: DetalleSalida[];
}

/**
 * Interfaz para detalles de una salida
 */
export interface DetalleSalida {
  producto_id: number;
  producto_folio: string;
  descripcion: string;
  partida: string;
  unidad: string;
  cantidad: number;
  fecha: string;
}

/**
 * Nueva interfaz para formato de entrega
 */
export interface EntregaFormato {
  [x: string]: any;
  id_formato: number;
  folio_formato: string;
  mes_cantidad: string;
  persona_recibe: string;
  ct_usuario_id: number;
  createdAt: string;
  updatedAt: string;

  // Información de relaciones
  ct_usuario?: {
    id_usuario: number;
    nombre_usuario: string;
  };
  dt_consumible_entregas: any[];
  cantidadTotal: number;
  departamento_nombre: string;
  departamento_id: number;
  usuario_nombre: string;

  // Campo para documento
  documento_path?: string;
  documento_nombre?: string;
}

/**
 * Interface para los filtros del historial
 */
export interface FiltrosHistorial {
  fechaInicio?: string;
  fechaFin?: string;
  departamento?: number;
  folio?: string;
  usuario?: number;
}

/**
 * Interface para datos necesarios para generar el PDF
 */
export interface DatosPdfSalida {
  title: string;
  data: any;
  options: {
    fileName?: string;
    orientation?: 'portrait' | 'landscape';
    format?: string;
    documentProperties?: {
      title?: string;
      author?: string;
      subject?: string;
      keywords?: string;
    };
    signatureFields?: {
      label: string;
      sublabel?: string;
      name?: string;
    }[];
  };
}
