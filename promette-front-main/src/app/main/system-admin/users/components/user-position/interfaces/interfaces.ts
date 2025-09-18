// interfaces.ts
export interface UserPosition {
  id_usuario_puesto: number;
  ct_usuario_id: number;
  ct_puesto_id: number;
  periodo_inicio: string;
  periodo_final: string;
  plaza: string;
  ct_sindicato_id: number;
}


export interface ModalData {
  mode?: 'view' | 'edit' | 'add';
  id_usuario_puesto?: number;
  ct_usuario_id?: number;
  ct_puesto_id?: number;
  loadData?: () => void;
}
