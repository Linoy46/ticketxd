// interfaces.ts
export interface Department {
  id_departamento: number;
  nombre_departamento: string;
  ct_direccion_id: number;
  estado: number;
  ct_usuario_in: number;
}

export interface ModalData {
  mode?: 'view' | 'edit' | 'add';
  id_departamento?: number;
  loadData?: () => void;
}
