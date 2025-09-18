// interfaces.ts
export interface Module {
  id_modulo: number;
  nombre_modulo: string;
  modulo_padre: string;
  clave: string;
  icono: string;
  ct_usuario_in: number;
}

export interface ModalData {
  mode?: 'view' | 'edit' | 'add';
  id_modulo?: number;
  loadData?: () => void;
}
