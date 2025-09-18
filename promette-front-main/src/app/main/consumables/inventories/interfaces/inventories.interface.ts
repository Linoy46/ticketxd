/**
 * Interfaz que define la estructura de un elemento del inventario
 * Contiene toda la información necesaria de cada entrada en inventario
 * Estructura basada en el modelo dt_consumible_inventario
 */
export interface Inventario {
  id_inventario: number;
  folio: string;
  descripcion: string; // Cambiado de description a descripcion para coincidir con backend
  observaciones?: string; // Campo opcional para observaciones adicionales
  cantidad: number;
  resta?: number; // Campo presente en el modelo del backend
  ct_partida_id: number; // Cambiado de id_partida a ct_partida_id
  ct_unidad_id: number; // Cambiado de id_unidad_medida a ct_unidad_id
  ct_factura_id: number; // Cambiado de id_factura a ct_factura_id

  // Relaciones que pueden estar incluidas cuando se obtiene un inventario
  ct_partida?: Partida;
  ct_unidad?: UnidadMedida;
  ct_factura?: Factura;

  // Timestamps (cambiados para coincidir con nombres de Sequelize)
  createdAt?: string; // fecha de creación (antes fecha_in)
  updatedAt?: string; // fecha de actualización (antes fecha_at)

  // Mantener compatibilidad con código existente
  description?: string; // Alias para descripcion
  id_partida?: number; // Alias para ct_partida_id
  id_unidad_medida?: number; // Alias para ct_unidad_id
  id_factura?: number; // Alias para ct_factura_id
  fecha_in?: string; // Alias para createdAt
  fecha_at?: string; // Alias para updatedAt
}

/**
 * Interfaz que define la estructura de una partida presupuestal
 * Representa los capítulos o categorías de gasto
 * Adaptada para manejar las propiedades del backend (clave_partida, nombre_partida)
 */
export interface Partida {
  id_partida: number;
  clave: string; // En frontend usamos clave
  nombre: string; // En frontend usamos nombre
  createdAt?: string;
  updatedAt?: string;
  fecha_in?: string; // Para compatibilidad
  fecha_at?: string; // Para compatibilidad

  // Propiedades adicionales para compatibilidad con el backend
  clave_partida?: string; // En backend es clave_partida
  nombre_partida?: string; // En backend es nombre_partida
}

/**
 * Interfaz que define la estructura de una unidad de medida
 * Representa las diferentes formas de medir cantidades (piezas, kg, etc)
 * Adaptada para manejar las propiedades del backend (clave_unidad, nombre_unidad)
 */
export interface UnidadMedida {
  id_unidad: number; // Cambiado de id_unidad_medida a id_unidad según backend
  clave: string; // En frontend usamos clave
  nombre_unidad?: string; // Nombre completo de la unidad
  createdAt?: string;
  updatedAt?: string;
  fecha_in?: string; // Para compatibilidad
  fecha_at?: string; // Para compatibilidad

  // Propiedades adicionales para compatibilidad
  id_unidad_medida?: number;
  clave_unidad?: string; // En backend es clave_unidad
}

/**
 * Interfaz que define la estructura de un proveedor
 */
export interface Proveedor {
  id_provedor: number;
  nombre: string;
  rfc?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interfaz que define la estructura de una factura
 * Vincula facturas con proveedores y contiene información de compra
 */
export interface Factura {
  id_factura: number;
  factura: string;
  ct_provedor_id: number; // Cambiado de id_provedor a ct_provedor_id
  ct_provedor?: Proveedor; // Relación con proveedor
  createdAt?: string;
  updatedAt?: string;
  fecha_in?: string; // Para compatibilidad
  fecha_at?: string; // Para compatibilidad

  // Alias para compatibilidad
  id_provedor?: number;

  // Agrega cualquier otro campo necesario
  dt_consumible_inventarios?: any[];
}

/**
 * Interfaz para elementos de menús desplegables (dropdowns)
 * Estandariza el formato de opciones en selectores
 */
export interface DropdownItem {
  id: number;
  name: string;
  code?: string;
}
