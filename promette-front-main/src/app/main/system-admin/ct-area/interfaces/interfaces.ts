// interfaces.ts
export interface Area {
  id_area: number;
  nombre_area: string;
  indice: string;
  ct_departamento_id: string;
  ct_usuario_in: string;
}

export interface ModalData {
  mode?: 'view' | 'edit' | 'add';
  id_area?: number;
  loadData?: () => void;
}
