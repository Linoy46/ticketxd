// interfaces.ts
export interface Function {
  id_funcion: number;
  ct_modulo_id: number;
  nombre_funcion: string;
  descripcion: string;
}

export interface ModalData {
  mode?: 'view' | 'edit' | 'add';
  id_modulo?: number;
  id_funcion?: number;
  loadData?: () => void;
}
