// interfaces.ts
export interface History {
  id_bitacora?: number;
  ct_usuario_id: number;
  ct_accion_id: number;
  registro_id: number;
  ct_tabla_id: number;
  ct_dispositivo_id: number;
  estatus_accion: number;
  detalles_error: string;
}

export interface ModalData {
  mode?: 'view' | 'edit' | 'add';
  id_bitacora?: number;
  loadData?: () => void;
}
