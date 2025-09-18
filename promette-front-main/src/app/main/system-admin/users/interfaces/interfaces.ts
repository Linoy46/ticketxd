// interfaces.ts
export interface User {
  id_usuario: number;
  nombre_usuario: string;
  telefono: string;
  email: string;
  email_institucional: string;
  curp: string;
  estado: boolean;
}


export interface ModalData {
  mode?: 'view' | 'edit' | 'add';
  id_usuario?: number;
  loadData?: () => void;
}
