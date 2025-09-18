// Base administrative unit interface
export interface AdminUnit {
  id: number;
  name: string;
  manager: User | null;
  analyst: User | null;
}

export interface User {
  id: number;
  name: string;
  role: string;
  avatar: string;
}

// Interfaces basadas en los modelos del backend

// Interfaz para ct_usuario
export interface UserBackend {
  id_usuario: number;
  nombre_usuario: string;
  email: string;
  telefono: string;
  curp: string;
  email_institucional?: string;
  estado: number;
}

// Interfaz para ct_area
export interface Area {
  id_area: number;
  nombre_area: string;
  ct_departamento_id: number;
  estado: number;
}

// Interfaz para ct_departamento_sistema
export interface Department {
  id_departamento: number;
  nombre_departamento: string;
  ct_direccion_id: number;
  estado: number;
}

// Interfaz para ct_direccion_sistema
export interface Direction {
  id_direccion: number;
  nombre_direccion: string;
  estado: number;
}

// Interfaz para ct_puesto
export interface Position {
  id_puesto: number;
  nombre_puesto: string;
  ct_area_id: number;
  estado: number;
}

// Interfaz para ct_sindicato
export interface Sindicate {
  id_sindicato: number;
  nombre_sindicato: string;
  estado: number;
}

// Interfaz para rl_usuario_puesto
export interface UserPosition {
  id_usuario_puesto: number;
  ct_usuario_id: number;
  ct_puesto_id: number;
  periodo_inicio: string;
  periodo_final?: string;
  plaza: string;
  ct_sindicato_id: number;
  estado: number;
  ct_usuario_in: number;
  ct_usuario_at?: number;
}

// Interfaz para información completa de puesto con jerarquía
export interface PositionComplete {
  id_usuario_puesto: number;
  ct_usuario_id: number;
  ct_puesto_id: number;
  periodo_inicio: string;
  periodo_final?: string;
  plaza: string;
  ct_sindicato_id: number;
  estado: number;
  ct_usuario_in: number;
  ct_usuario_at?: number;
  ct_puesto?: {
    nombre_puesto: string;
    ct_area?: {
      nombre_area: string;
      ct_departamento?: {
        nombre_departamento: string;
        ct_direccion?: {
          nombre_direccion: string;
        };
      };
    };
  };
  ct_sindicato?: {
    nombre_sindicato: string;
  };
}

// Interfaz para analistas de unidades (rl_analista_unidad)
export interface Analyst {
  id_puesto_unidad: number;
  ct_usuario_id: number;
  ct_area_id: number;
  rl_area_financiero_rl_area_financiero?: {
    id_area_fin: number;
  };
  estado: number;
  ct_usuario_in: number;
  ct_usuario_at?: number;
  ct_usuario?: {
    nombre_usuario: string;
    email: string;
    curp: string;
    telefono: string;
  };
  ct_area?: {
    nombre_area: string;
  };
  rl_area_financiero?: any;
}

// Interfaz para usuarios por puesto
export interface UserByPosition {
  id_usuario_puesto: number;
  id_usuario: number;
  nombre_usuario: string;
  email: string;
  id_puesto: number;
  puesto: string;
  periodo_inicio: string;
  periodo_final?: string;
}

// Interfaces para respuestas de la API

export interface ApiResponse<T> {
  msg?: string;
  success?: boolean;
}

export interface AnalystsResponse extends ApiResponse<Analyst[]> {
  analysts: Analyst[];
}

export interface AnalystResponse extends ApiResponse<Analyst> {
  analyst: Analyst;
}

export interface UserPositionsResponse extends ApiResponse<PositionComplete[]> {
  userPosition: PositionComplete[];
}

export interface UserPositionResponse extends ApiResponse<PositionComplete> {
  userPosition: PositionComplete;
}

export interface UsersResponse extends ApiResponse<UserBackend[]> {
  users: UserBackend[];
  areas?: any[];
}

export interface UserResponse extends ApiResponse<UserBackend> {
  user: UserBackend;
}

export interface UsersByPositionResponse extends ApiResponse<UserByPosition[]> {
  users: UserByPosition[];
}

// Interfaces para peticiones al backend

export interface NewAnalystRequest {
  ct_usuario_id: number;
  ct_area_id: number;
  rl_area_financiero_id?: number; // Campo para asociar con unidad administrativa
  estado: number;
  ct_usuario_in: number;
  ct_usuario_at?: number;
}

export interface UpdateAnalystRequest extends NewAnalystRequest {
  id_puesto_unidad: number;
}

export interface DeleteAnalystRequest {
  id_puesto_unidad: number;
  ct_usuario_at: number;
}

export interface NewUserPositionRequest {
  ct_usuario_id: number;
  ct_puesto_id: number;
  periodo_inicio: string;
  periodo_final?: string;
  plaza: string;
  ct_sindicato_id: number;
  ct_usuario_in: number;
  ct_usuario_at?: number;
}

export interface UpdateUserPositionRequest extends NewUserPositionRequest {
  id_usuario_puesto: number;
}

export interface DeleteUserPositionRequest {
  id_usuario_puesto: number;
  ct_usuario_at: number;
}

// Interfaz para rl_area_financiero (unidades administrativas)
export interface AdministrativeUnit {
  id_area_fin: number;
  id_financiero: number;
  id_area_infra: number;
  nombre: string; // Este campo viene del endpoint y contiene el nombre del área
  nombre_area?: string; // Agregado para el select
  ct_usuario_in: number;
  ct_usuario_at?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AdministrativeUnitsResponse {
  administrativeUnits: AdministrativeUnit[];
}
