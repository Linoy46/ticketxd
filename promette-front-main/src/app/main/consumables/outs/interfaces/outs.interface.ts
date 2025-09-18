import {
  Inventario,
  Partida,
  UnidadMedida,
} from '../../../consumables/inventories/interfaces/inventories.interface';

// Interfaces para direcciones (consumableDirection)
export interface Direccion {
  id_direccion: number;
  nombre_direccion: string;
  ct_puesto_id?: number;
  ct_consumible_departamentos?: Departamento[];
  fecha_in?: string;
  fecha_at?: string;
}

// Interfaces para departamentos (consumableDepartment)
export interface Departamento {
  id_departamento: number;
  nombre_departamento: string;
  ct_direccion_id: number;
  ct_puesto_id?: number;
  ct_direccion?: Direccion;
  fecha_in?: string;
  fecha_at?: string;
}

// Interface para facturas (consumableInvoice)
export interface Factura {
  id_factura: number;
  factura: string;
  ct_provedor_id: number;
  ct_provedor?: any; // Proveedor asociado
  dt_consumible_inventarios?: any[]; // Inventarios asociados - definido como any[] para evitar errores
}

// Interface para partidas (item)
export interface ItemPartida {
  id_partida: number;
  clave_partida: string;
  nombre_partida: string;
  estado: number;
  ct_producto_consumibles?: any[]; // Productos asociados
}

// Producto seleccionado para la salida
export interface ProductoSeleccionado extends Inventario {
  cantidadSeleccionada?: number;
  errorMessage?: string;
}

// Interface para el registro de salida hacia el backend
export interface RegistroSalida {
  id_area: number;
  productos: {
    id_inventario: number;
    cantidad: number;
    ct_unidad_id?: number;
  }[];
  ct_usuario_id: number;
  observaciones?: string;
}

// Interface para la respuesta del registro de salida
export interface RegistroSalidaResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    folio: string;
    fecha: string;
  };
}

// Interfaces para los dropdowns
export interface DireccionDropdown {
  value: number;
  label: string;
}

export interface DepartamentoDropdown {
  value: number;
  label: string;
}

// Interface para la factura en el dropdown
export interface FacturaDropdown {
  id_Factura: number;
  folio: string;
  id_partida?: number;
}

// Interface para la partida en el dropdown
export interface PartidaDropdown {
  id_partida: number;
  partida: string;
  nombre: string;
}

// Interface de respuesta para la API de direcciones
export interface DireccionResponse {
  directions: Direccion[];
  msg?: string;
}

// Interface de respuesta para la API de departamentos
export interface DepartamentoResponse {
  departments: Departamento[];
  msg?: string;
}

// Interface de respuesta para la API de facturas
export interface FacturaResponse {
  invoices: Factura[];
  msg?: string;
}

// Interface de respuesta para la API de partidas
export interface PartidaResponse {
  items: ItemPartida[];
  msg?: string;
}

// Interface para datos de factura (si se requiere)
export interface DatosFactura {
  razonSocial: string;
  rfc: string;
  direccionFiscal: string;
}

// Interface para entregas de consumibles
export interface EntregaConsumible {
  id_entrega: number;
  folio: string;
  ct_departamento_id: number;
  dt_inventario_id: number;
  ct_unidad_id: number;
  cantidad: number;
  ct_usuario_id: number;
  folio_formato?: string | null; // Campo nuevo para relación con formato
  createdAt?: string;
  updatedAt?: string;

  // Relaciones
  departamento?: Departamento;
  inventario?: Inventario;
  unidad_medida?: UnidadMedida;
  usuario_entrega?: {
    id_usuario: number;
    nombre_usuario: string;
  };
  formato?: EntregaFormato; // Relación con formato de entrega
}

// Nueva interfaz para formato de entrega
export interface EntregaFormato {
  id_formato: number;
  folio_formato: string;
  mes_cantidad: string | null;
  persona_recibe: string | null;
  ct_usuario_id: number;
  createdAt?: string;
  updatedAt?: string;

  // Relaciones
  ct_usuario?: {
    id_usuario: number;
    nombre_usuario: string;
  };
  dt_consumible_entregas?: EntregaConsumible[]; // Entregas asociadas al formato
}

// Interfaz para datos de formato de entrega (creación/actualización)
export interface EntregaFormatoInput {
  mes_cantidad?: string | null;
  persona_recibe?: string | null;
  ct_usuario_id: number;
  entregas_ids?: number[]; // IDs de entregas a asociar
}

// Interfaz para respuesta de formato de entrega
export interface EntregaFormatoResponse {
  formato: EntregaFormato;
  msg?: string;
}

// Interfaz para listado de formatos de entrega
export interface EntregaFormatosResponse {
  formatos: EntregaFormato[];
  msg?: string;
}
