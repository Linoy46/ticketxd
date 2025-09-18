// interfaces.ts
export interface Direction {
  id_direccion: number;
  nombre_direccion: string;
  ct_dependencia_id: number;
  ct_usuario_in: number;
}

export interface ModalData {
  mode?: 'view' | 'edit' | 'add';
  id_direccion?: number;
  loadData?: () => void;
}
