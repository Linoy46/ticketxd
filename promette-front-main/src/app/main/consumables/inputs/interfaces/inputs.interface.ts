/**
 * Representa una entrada de inventario de consumibles.
 * Basado en el modelo dt_consumible_inventario.
 */
export interface Inventario {
  /** ID único del inventario */
  id_inventario: number;
  /** Folio único de la entrada */
  folio: string;
  /** Descripción del producto o entrada */
  descripcion?: string;
  /** Observaciones adicionales opcionales */
  observaciones?: string;
  /** Cantidad total registrada */
  cantidad: number;
  /** Cantidad restante disponible */
  resta: number;
  /** ID de la partida asociada */
  ct_partida_id: number;
  /** ID de la unidad de medida asociada */
  ct_unidad_id: number;
  /** ID de la factura asociada */
  ct_factura_id: number;
  /** Fecha de creación */
  createdAt: Date;
  /** Fecha de última actualización */
  updatedAt: Date;
}

/**
 * Representa una factura de consumibles.
 * Basado en el modelo ct_consumible_factura.
 */
export interface Factura {
  /** ID único de la factura */
  id_factura: number;
  /** Número o folio de la factura */
  factura: string;
  /** ID del proveedor asociado */
  ct_provedor_id: number;
  /** Fecha de creación */
  createdAt: Date;
  /** Fecha de última actualización */
  updatedAt: Date;
}

/**
 * Representa un proveedor de consumibles.
 * Basado en el modelo ct_consumibles_proveedor.
 */
export interface Proveedor {
  /** ID único del proveedor */
  id_proveedor: number;
  /** Razón social del proveedor */
  razon_social: string;
  /** Estado del proveedor (activo/inactivo) */
  estado: number;
  /** Fecha de creación */
  createdAt: Date;
  /** Fecha de última actualización */
  updatedAt: Date;
}

/**
 * Representa una unidad de medida.
 * Basado en el modelo ct_unidad_medida.
 */
export interface UnidadMedida {
  /** ID único de la unidad de medida */
  id_unidad: number;
  /** Clave de la unidad de medida (ej: 'PZA', 'KG') */
  clave_unidad: string;
  /** Nombre de la unidad de medida */
  nombre_unidad: string;
  /** Fecha de creación */
  createdAt: Date;
  /** Fecha de última actualización */
  updatedAt: Date;
}

/**
 * Representa una partida presupuestaria.
 * Basado en el modelo ct_partida.
 */
export interface Partida {
  /** ID único de la partida */
  id_partida: number;
  /** ID del capítulo al que pertenece la partida */
  ct_capitulo_id: number;
  /** Clave o código de la partida */
  clave_partida: string;
  /** Nombre descriptivo de la partida */
  nombre_partida: string;
  /** Estado de la partida (activo/inactivo) */
  estado: number;
  /** Fecha de creación */
  createdAt: Date;
  /** Fecha de última actualización */
  updatedAt: Date;

  // Propiedades opcionales utilizadas en algunos casos
  /** Alias para clave_partida, usada en algunos contextos */
  clave?: string;
  /** Alias para nombre_partida, usada en algunos contextos */
  nombre?: string;
}

/**
 * Estructura para opciones de dropdown en formularios.
 */
export interface DropdownItem {
  id: number;
  name: string;
  code: string;
}

/**
 * Estructura para los datos de formularios.
 */
export interface FormData {
  partidas: Partida[];
  unidades: UnidadMedida[];
}
