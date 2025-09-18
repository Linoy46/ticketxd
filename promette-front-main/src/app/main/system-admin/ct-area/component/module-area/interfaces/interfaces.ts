// interfaces.ts
export interface ModuleArea {
  id_modulo_area: number;
  ct_modulo_id: number;
  ct_area_id: number;
  ct_modulo?: any;
  nomre_modulo?: number;
}

export interface ModalData {
  mode?: 'view' | 'edit' | 'add';
  id_modulo_area?: number;
  ct_modulo_id?: number;
  id_area?: number;
  moduleArea?: any;
  loadData?: () => void;
}
