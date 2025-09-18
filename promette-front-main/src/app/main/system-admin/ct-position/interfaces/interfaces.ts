// interfaces.ts
export interface Position {
  id_puesto: number;
  nombre_puesto: string;
  descripcion: string;
  ct_area_id: number;
  ct_departamento_superios_id: number;
  ct_usuario_in: number;
}

export interface ModalData {
  mode?: 'view' | 'edit' | 'add';
  id_puesto?: number;
  loadData?: () => void;
}
