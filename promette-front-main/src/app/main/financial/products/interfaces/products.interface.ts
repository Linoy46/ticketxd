/**
 * Interfaz para representar un producto consumible
 * Esta interfaz coincide con el modelo ct_producto_consumible del backend
 */
export interface Product {
  /** Identificador único del producto */
  id_producto: number;

  /** Nombre descriptivo del producto */
  nombre_producto: string;


  precio: number;


  ct_unidad_id: number;


  estado: number;

  ct_usuario_in: number;


  ct_usuario_at?: number;

  ct_partida_id: number;


  ct_unidad?: MeasurementUnit;


  ct_partida?: Item;
}


export interface MeasurementUnit {
  /** ID de la unidad de medida */
  id_unidad: number;


  clave_unidad?: string;


  nombre_unidad?: string;
}

/**
 * Interfaz para representar una partida presupuestal
 * Corresponde al modelo ct_partida en el backend
 */
export interface Item {
  /** ID de la partida */
  id_partida: number;

  /** Clave de la partida (COG) */
  clave_partida: string;

  /** Nombre descriptivo de la partida */
  nombre_partida: string;

  /** Estado de la partida (1: activo, 0: inactivo) */
  estado: number;
}

/**
 * Interfaz para representar un capítulo presupuestal
 * Corresponde al catálogo de capítulos en el backend
 */
export interface Chapter {
  /** ID del capítulo */
  id_capitulo: number;

  /** Clave del capítulo */
  clave_capitulo: string;

  /** Nombre descriptivo del capítulo */
  nombre_capitulo: string;

  /** Estado del capítulo (1: activo, 0: inactivo) */
  estado: number;
}

/**
 * Interfaz para crear un nuevo producto consumible
 * Basada en las validaciones del backend
 */
export interface CreateProductDto {
  /** Nombre descriptivo del producto (obligatorio, máx 100 caracteres) */
  nombre_producto: string;

  /** Precio unitario del producto (opcional, decimal) */
  precio?: number;

  /** ID de la unidad de medida (obligatorio) */
  ct_unidad_id: number;

  /** Estado del producto (opcional, booleano) */
  estado?: number;

  /** ID del usuario que registra (obligatorio) */
  ct_usuario_in: number;

  /** ID de la partida presupuestal (obligatorio) */
  ct_partida_id: number;
}

/**
 * Interfaz para actualizar un producto consumible
 * Extiende el DTO de creación y añade el ID de usuario que actualiza
 */
export interface UpdateProductDto extends CreateProductDto {
  /** ID del usuario que actualiza (opcional) */
  // id_producto?:number;
  ct_usuario_at?: number;
}

/**
 * Interfaz para respuestas paginadas del API
 */
export interface PaginatedResponse<T> {
  /** Elementos en la página actual */
  items: T[];

  /** Número total de elementos */
  total: number;

  /** Número de página actual */
  page: number;

  /** Tamaño de página */
  pageSize: number;
}

/**
 * Interfaz para respuestas estándar del API
 */
export interface ApiResponse<T> {
  /** Mensaje de la respuesta */
  msg: string;

  /** Datos retornados (opcional) */
  data?: T;
}

/**
 * Parámetros para filtrado de productos
 */
export interface ProductFilterParams {
  /** Filtro por término de búsqueda */
  searchTerm?: string;

  /** Filtro por ID de partida */
  ct_partida_id?: number;

  /** Filtro por ID de unidad de medida */
  ct_unidad_id?: number;

  /** Filtro por estado */
  estado?: number;

  /** Filtro por rango de precios */
  precioMin?: number;
  precioMax?: number;

  /** Parámetros de paginación */
  page?: number;
  pageSize?: number;

  /** Parámetros de ordenamiento */
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
