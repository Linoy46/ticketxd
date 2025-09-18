// interfaces.ts
export interface Dictamen {
  id_dictamen_escalafon: number;
  folio_dictamen: string;
  dt_informacion_rupeet_id: number;
  ct_grado_academico_id: number;
  dt_rupeet_documento_id: number;
  puntaje_escalafon: number;
  puntaje_antiguedad: number;
  total_puntaje_escalafon: number;
  ct_usuario_at: number;
  ct_usuario_in: string;
}

export interface ModalData {
  mode?: 'view' | 'edit' | 'add';
  id_dictamen_escalafon?: number;
  loadData?: () => void;
}
