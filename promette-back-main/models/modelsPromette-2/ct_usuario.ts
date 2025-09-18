import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_area, ct_areaId } from './ct_area';
import type { ct_departamento_sistema, ct_departamento_sistemaId } from './ct_departamento_sistema';
import type { ct_direccion_sistema, ct_direccion_sistemaId } from './ct_direccion_sistema';
import type { ct_modulo, ct_moduloId } from './ct_modulo';
import type { ct_producto_consumible, ct_producto_consumibleId } from './ct_producto_consumible';
import type { ct_puesto, ct_puestoId } from './ct_puesto';
import type { ct_sindicato, ct_sindicatoId } from './ct_sindicato';
import type { dt_aspirante_aneec, dt_aspirante_aneecId } from './dt_aspirante_aneec';
import type { dt_bitacora, dt_bitacoraId } from './dt_bitacora';
import type { dt_consumible_entrega, dt_consumible_entregaId } from './dt_consumible_entrega';
import type { dt_correspondencia, dt_correspondenciaId } from './dt_correspondencia';
import type { dt_diagnostico_aneec, dt_diagnostico_aneecId } from './dt_diagnostico_aneec';
import type { dt_dictamen_escalafon, dt_dictamen_escalafonId } from './dt_dictamen_escalafon';
import type { dt_funcion, dt_funcionId } from './dt_funcion';
import type { dt_informes_aneec, dt_informes_aneecId } from './dt_informes_aneec';
import type { dt_planeaciones_aneec, dt_planeaciones_aneecId } from './dt_planeaciones_aneec';
import type { dt_techo_presupuesto, dt_techo_presupuestoId } from './dt_techo_presupuesto';
import type { rl_analista_unidad, rl_analista_unidadId } from './rl_analista_unidad';
import type { rl_area_financiero, rl_area_financieroId } from './rl_area_financiero';
import type { rl_correspondencia_usuario_estado, rl_correspondencia_usuario_estadoId } from './rl_correspondencia_usuario_estado';
import type { rl_entrega_formato, rl_entrega_formatoId } from './rl_entrega_formato';
import type { rl_justificacion, rl_justificacionId } from './rl_justificacion';
import type { rl_producto_requisicion, rl_producto_requisicionId } from './rl_producto_requisicion';
import type { rl_usuario_funcion, rl_usuario_funcionId } from './rl_usuario_funcion';
import type { rl_usuario_puesto, rl_usuario_puestoId } from './rl_usuario_puesto';

export interface ct_usuarioAttributes {
  id_usuario: number;
  nombre_usuario: string;
  contrasena: string;
  telefono: string;
  email: string;
  email_institucional?: string;
  curp: string;
  estado: number;
  ct_usuario_in: number;
  ct_usuario_at?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ct_usuarioPk = "id_usuario";
export type ct_usuarioId = ct_usuario[ct_usuarioPk];
export type ct_usuarioOptionalAttributes = "id_usuario" | "email_institucional" | "estado" | "ct_usuario_at" | "createdAt" | "updatedAt";
export type ct_usuarioCreationAttributes = Optional<ct_usuarioAttributes, ct_usuarioOptionalAttributes>;

export class ct_usuario extends Model<ct_usuarioAttributes, ct_usuarioCreationAttributes> implements ct_usuarioAttributes {
  id_usuario!: number;
  nombre_usuario!: string;
  contrasena!: string;
  telefono!: string;
  email!: string;
  email_institucional?: string;
  curp!: string;
  estado!: number;
  ct_usuario_in!: number;
  ct_usuario_at?: number;
  createdAt!: Date;
  updatedAt!: Date;

  // ct_usuario hasMany ct_area via ct_usuario_in
  ct_areas!: ct_area[];
  getCt_areas!: Sequelize.HasManyGetAssociationsMixin<ct_area>;
  setCt_areas!: Sequelize.HasManySetAssociationsMixin<ct_area, ct_areaId>;
  addCt_area!: Sequelize.HasManyAddAssociationMixin<ct_area, ct_areaId>;
  addCt_areas!: Sequelize.HasManyAddAssociationsMixin<ct_area, ct_areaId>;
  createCt_area!: Sequelize.HasManyCreateAssociationMixin<ct_area>;
  removeCt_area!: Sequelize.HasManyRemoveAssociationMixin<ct_area, ct_areaId>;
  removeCt_areas!: Sequelize.HasManyRemoveAssociationsMixin<ct_area, ct_areaId>;
  hasCt_area!: Sequelize.HasManyHasAssociationMixin<ct_area, ct_areaId>;
  hasCt_areas!: Sequelize.HasManyHasAssociationsMixin<ct_area, ct_areaId>;
  countCt_areas!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany ct_area via ct_usuario_at
  ct_usuario_at_ct_areas!: ct_area[];
  getCt_usuario_at_ct_areas!: Sequelize.HasManyGetAssociationsMixin<ct_area>;
  setCt_usuario_at_ct_areas!: Sequelize.HasManySetAssociationsMixin<ct_area, ct_areaId>;
  addCt_usuario_at_ct_area!: Sequelize.HasManyAddAssociationMixin<ct_area, ct_areaId>;
  addCt_usuario_at_ct_areas!: Sequelize.HasManyAddAssociationsMixin<ct_area, ct_areaId>;
  createCt_usuario_at_ct_area!: Sequelize.HasManyCreateAssociationMixin<ct_area>;
  removeCt_usuario_at_ct_area!: Sequelize.HasManyRemoveAssociationMixin<ct_area, ct_areaId>;
  removeCt_usuario_at_ct_areas!: Sequelize.HasManyRemoveAssociationsMixin<ct_area, ct_areaId>;
  hasCt_usuario_at_ct_area!: Sequelize.HasManyHasAssociationMixin<ct_area, ct_areaId>;
  hasCt_usuario_at_ct_areas!: Sequelize.HasManyHasAssociationsMixin<ct_area, ct_areaId>;
  countCt_usuario_at_ct_areas!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany ct_departamento_sistema via ct_usuario_in
  ct_departamento_sistemas!: ct_departamento_sistema[];
  getCt_departamento_sistemas!: Sequelize.HasManyGetAssociationsMixin<ct_departamento_sistema>;
  setCt_departamento_sistemas!: Sequelize.HasManySetAssociationsMixin<ct_departamento_sistema, ct_departamento_sistemaId>;
  addCt_departamento_sistema!: Sequelize.HasManyAddAssociationMixin<ct_departamento_sistema, ct_departamento_sistemaId>;
  addCt_departamento_sistemas!: Sequelize.HasManyAddAssociationsMixin<ct_departamento_sistema, ct_departamento_sistemaId>;
  createCt_departamento_sistema!: Sequelize.HasManyCreateAssociationMixin<ct_departamento_sistema>;
  removeCt_departamento_sistema!: Sequelize.HasManyRemoveAssociationMixin<ct_departamento_sistema, ct_departamento_sistemaId>;
  removeCt_departamento_sistemas!: Sequelize.HasManyRemoveAssociationsMixin<ct_departamento_sistema, ct_departamento_sistemaId>;
  hasCt_departamento_sistema!: Sequelize.HasManyHasAssociationMixin<ct_departamento_sistema, ct_departamento_sistemaId>;
  hasCt_departamento_sistemas!: Sequelize.HasManyHasAssociationsMixin<ct_departamento_sistema, ct_departamento_sistemaId>;
  countCt_departamento_sistemas!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany ct_departamento_sistema via ct_usuario_at
  ct_usuario_at_ct_departamento_sistemas!: ct_departamento_sistema[];
  getCt_usuario_at_ct_departamento_sistemas!: Sequelize.HasManyGetAssociationsMixin<ct_departamento_sistema>;
  setCt_usuario_at_ct_departamento_sistemas!: Sequelize.HasManySetAssociationsMixin<ct_departamento_sistema, ct_departamento_sistemaId>;
  addCt_usuario_at_ct_departamento_sistema!: Sequelize.HasManyAddAssociationMixin<ct_departamento_sistema, ct_departamento_sistemaId>;
  addCt_usuario_at_ct_departamento_sistemas!: Sequelize.HasManyAddAssociationsMixin<ct_departamento_sistema, ct_departamento_sistemaId>;
  createCt_usuario_at_ct_departamento_sistema!: Sequelize.HasManyCreateAssociationMixin<ct_departamento_sistema>;
  removeCt_usuario_at_ct_departamento_sistema!: Sequelize.HasManyRemoveAssociationMixin<ct_departamento_sistema, ct_departamento_sistemaId>;
  removeCt_usuario_at_ct_departamento_sistemas!: Sequelize.HasManyRemoveAssociationsMixin<ct_departamento_sistema, ct_departamento_sistemaId>;
  hasCt_usuario_at_ct_departamento_sistema!: Sequelize.HasManyHasAssociationMixin<ct_departamento_sistema, ct_departamento_sistemaId>;
  hasCt_usuario_at_ct_departamento_sistemas!: Sequelize.HasManyHasAssociationsMixin<ct_departamento_sistema, ct_departamento_sistemaId>;
  countCt_usuario_at_ct_departamento_sistemas!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany ct_direccion_sistema via ct_usuario_in
  ct_direccion_sistemas!: ct_direccion_sistema[];
  getCt_direccion_sistemas!: Sequelize.HasManyGetAssociationsMixin<ct_direccion_sistema>;
  setCt_direccion_sistemas!: Sequelize.HasManySetAssociationsMixin<ct_direccion_sistema, ct_direccion_sistemaId>;
  addCt_direccion_sistema!: Sequelize.HasManyAddAssociationMixin<ct_direccion_sistema, ct_direccion_sistemaId>;
  addCt_direccion_sistemas!: Sequelize.HasManyAddAssociationsMixin<ct_direccion_sistema, ct_direccion_sistemaId>;
  createCt_direccion_sistema!: Sequelize.HasManyCreateAssociationMixin<ct_direccion_sistema>;
  removeCt_direccion_sistema!: Sequelize.HasManyRemoveAssociationMixin<ct_direccion_sistema, ct_direccion_sistemaId>;
  removeCt_direccion_sistemas!: Sequelize.HasManyRemoveAssociationsMixin<ct_direccion_sistema, ct_direccion_sistemaId>;
  hasCt_direccion_sistema!: Sequelize.HasManyHasAssociationMixin<ct_direccion_sistema, ct_direccion_sistemaId>;
  hasCt_direccion_sistemas!: Sequelize.HasManyHasAssociationsMixin<ct_direccion_sistema, ct_direccion_sistemaId>;
  countCt_direccion_sistemas!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany ct_direccion_sistema via ct_usuario_at
  ct_usuario_at_ct_direccion_sistemas!: ct_direccion_sistema[];
  getCt_usuario_at_ct_direccion_sistemas!: Sequelize.HasManyGetAssociationsMixin<ct_direccion_sistema>;
  setCt_usuario_at_ct_direccion_sistemas!: Sequelize.HasManySetAssociationsMixin<ct_direccion_sistema, ct_direccion_sistemaId>;
  addCt_usuario_at_ct_direccion_sistema!: Sequelize.HasManyAddAssociationMixin<ct_direccion_sistema, ct_direccion_sistemaId>;
  addCt_usuario_at_ct_direccion_sistemas!: Sequelize.HasManyAddAssociationsMixin<ct_direccion_sistema, ct_direccion_sistemaId>;
  createCt_usuario_at_ct_direccion_sistema!: Sequelize.HasManyCreateAssociationMixin<ct_direccion_sistema>;
  removeCt_usuario_at_ct_direccion_sistema!: Sequelize.HasManyRemoveAssociationMixin<ct_direccion_sistema, ct_direccion_sistemaId>;
  removeCt_usuario_at_ct_direccion_sistemas!: Sequelize.HasManyRemoveAssociationsMixin<ct_direccion_sistema, ct_direccion_sistemaId>;
  hasCt_usuario_at_ct_direccion_sistema!: Sequelize.HasManyHasAssociationMixin<ct_direccion_sistema, ct_direccion_sistemaId>;
  hasCt_usuario_at_ct_direccion_sistemas!: Sequelize.HasManyHasAssociationsMixin<ct_direccion_sistema, ct_direccion_sistemaId>;
  countCt_usuario_at_ct_direccion_sistemas!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany ct_modulo via ct_usuario_in
  ct_modulos!: ct_modulo[];
  getCt_modulos!: Sequelize.HasManyGetAssociationsMixin<ct_modulo>;
  setCt_modulos!: Sequelize.HasManySetAssociationsMixin<ct_modulo, ct_moduloId>;
  addCt_modulo!: Sequelize.HasManyAddAssociationMixin<ct_modulo, ct_moduloId>;
  addCt_modulos!: Sequelize.HasManyAddAssociationsMixin<ct_modulo, ct_moduloId>;
  createCt_modulo!: Sequelize.HasManyCreateAssociationMixin<ct_modulo>;
  removeCt_modulo!: Sequelize.HasManyRemoveAssociationMixin<ct_modulo, ct_moduloId>;
  removeCt_modulos!: Sequelize.HasManyRemoveAssociationsMixin<ct_modulo, ct_moduloId>;
  hasCt_modulo!: Sequelize.HasManyHasAssociationMixin<ct_modulo, ct_moduloId>;
  hasCt_modulos!: Sequelize.HasManyHasAssociationsMixin<ct_modulo, ct_moduloId>;
  countCt_modulos!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany ct_modulo via ct_usuario_at
  ct_usuario_at_ct_modulos!: ct_modulo[];
  getCt_usuario_at_ct_modulos!: Sequelize.HasManyGetAssociationsMixin<ct_modulo>;
  setCt_usuario_at_ct_modulos!: Sequelize.HasManySetAssociationsMixin<ct_modulo, ct_moduloId>;
  addCt_usuario_at_ct_modulo!: Sequelize.HasManyAddAssociationMixin<ct_modulo, ct_moduloId>;
  addCt_usuario_at_ct_modulos!: Sequelize.HasManyAddAssociationsMixin<ct_modulo, ct_moduloId>;
  createCt_usuario_at_ct_modulo!: Sequelize.HasManyCreateAssociationMixin<ct_modulo>;
  removeCt_usuario_at_ct_modulo!: Sequelize.HasManyRemoveAssociationMixin<ct_modulo, ct_moduloId>;
  removeCt_usuario_at_ct_modulos!: Sequelize.HasManyRemoveAssociationsMixin<ct_modulo, ct_moduloId>;
  hasCt_usuario_at_ct_modulo!: Sequelize.HasManyHasAssociationMixin<ct_modulo, ct_moduloId>;
  hasCt_usuario_at_ct_modulos!: Sequelize.HasManyHasAssociationsMixin<ct_modulo, ct_moduloId>;
  countCt_usuario_at_ct_modulos!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany ct_producto_consumible via ct_usuario_in
  ct_producto_consumibles!: ct_producto_consumible[];
  getCt_producto_consumibles!: Sequelize.HasManyGetAssociationsMixin<ct_producto_consumible>;
  setCt_producto_consumibles!: Sequelize.HasManySetAssociationsMixin<ct_producto_consumible, ct_producto_consumibleId>;
  addCt_producto_consumible!: Sequelize.HasManyAddAssociationMixin<ct_producto_consumible, ct_producto_consumibleId>;
  addCt_producto_consumibles!: Sequelize.HasManyAddAssociationsMixin<ct_producto_consumible, ct_producto_consumibleId>;
  createCt_producto_consumible!: Sequelize.HasManyCreateAssociationMixin<ct_producto_consumible>;
  removeCt_producto_consumible!: Sequelize.HasManyRemoveAssociationMixin<ct_producto_consumible, ct_producto_consumibleId>;
  removeCt_producto_consumibles!: Sequelize.HasManyRemoveAssociationsMixin<ct_producto_consumible, ct_producto_consumibleId>;
  hasCt_producto_consumible!: Sequelize.HasManyHasAssociationMixin<ct_producto_consumible, ct_producto_consumibleId>;
  hasCt_producto_consumibles!: Sequelize.HasManyHasAssociationsMixin<ct_producto_consumible, ct_producto_consumibleId>;
  countCt_producto_consumibles!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany ct_producto_consumible via ct_usuario_at
  ct_usuario_at_ct_producto_consumibles!: ct_producto_consumible[];
  getCt_usuario_at_ct_producto_consumibles!: Sequelize.HasManyGetAssociationsMixin<ct_producto_consumible>;
  setCt_usuario_at_ct_producto_consumibles!: Sequelize.HasManySetAssociationsMixin<ct_producto_consumible, ct_producto_consumibleId>;
  addCt_usuario_at_ct_producto_consumible!: Sequelize.HasManyAddAssociationMixin<ct_producto_consumible, ct_producto_consumibleId>;
  addCt_usuario_at_ct_producto_consumibles!: Sequelize.HasManyAddAssociationsMixin<ct_producto_consumible, ct_producto_consumibleId>;
  createCt_usuario_at_ct_producto_consumible!: Sequelize.HasManyCreateAssociationMixin<ct_producto_consumible>;
  removeCt_usuario_at_ct_producto_consumible!: Sequelize.HasManyRemoveAssociationMixin<ct_producto_consumible, ct_producto_consumibleId>;
  removeCt_usuario_at_ct_producto_consumibles!: Sequelize.HasManyRemoveAssociationsMixin<ct_producto_consumible, ct_producto_consumibleId>;
  hasCt_usuario_at_ct_producto_consumible!: Sequelize.HasManyHasAssociationMixin<ct_producto_consumible, ct_producto_consumibleId>;
  hasCt_usuario_at_ct_producto_consumibles!: Sequelize.HasManyHasAssociationsMixin<ct_producto_consumible, ct_producto_consumibleId>;
  countCt_usuario_at_ct_producto_consumibles!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany ct_puesto via ct_usuario_in
  ct_puestos!: ct_puesto[];
  getCt_puestos!: Sequelize.HasManyGetAssociationsMixin<ct_puesto>;
  setCt_puestos!: Sequelize.HasManySetAssociationsMixin<ct_puesto, ct_puestoId>;
  addCt_puesto!: Sequelize.HasManyAddAssociationMixin<ct_puesto, ct_puestoId>;
  addCt_puestos!: Sequelize.HasManyAddAssociationsMixin<ct_puesto, ct_puestoId>;
  createCt_puesto!: Sequelize.HasManyCreateAssociationMixin<ct_puesto>;
  removeCt_puesto!: Sequelize.HasManyRemoveAssociationMixin<ct_puesto, ct_puestoId>;
  removeCt_puestos!: Sequelize.HasManyRemoveAssociationsMixin<ct_puesto, ct_puestoId>;
  hasCt_puesto!: Sequelize.HasManyHasAssociationMixin<ct_puesto, ct_puestoId>;
  hasCt_puestos!: Sequelize.HasManyHasAssociationsMixin<ct_puesto, ct_puestoId>;
  countCt_puestos!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany ct_puesto via ct_usuario_at
  ct_usuario_at_ct_puestos!: ct_puesto[];
  getCt_usuario_at_ct_puestos!: Sequelize.HasManyGetAssociationsMixin<ct_puesto>;
  setCt_usuario_at_ct_puestos!: Sequelize.HasManySetAssociationsMixin<ct_puesto, ct_puestoId>;
  addCt_usuario_at_ct_puesto!: Sequelize.HasManyAddAssociationMixin<ct_puesto, ct_puestoId>;
  addCt_usuario_at_ct_puestos!: Sequelize.HasManyAddAssociationsMixin<ct_puesto, ct_puestoId>;
  createCt_usuario_at_ct_puesto!: Sequelize.HasManyCreateAssociationMixin<ct_puesto>;
  removeCt_usuario_at_ct_puesto!: Sequelize.HasManyRemoveAssociationMixin<ct_puesto, ct_puestoId>;
  removeCt_usuario_at_ct_puestos!: Sequelize.HasManyRemoveAssociationsMixin<ct_puesto, ct_puestoId>;
  hasCt_usuario_at_ct_puesto!: Sequelize.HasManyHasAssociationMixin<ct_puesto, ct_puestoId>;
  hasCt_usuario_at_ct_puestos!: Sequelize.HasManyHasAssociationsMixin<ct_puesto, ct_puestoId>;
  countCt_usuario_at_ct_puestos!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany ct_sindicato via ct_usuario_in
  ct_sindicatos!: ct_sindicato[];
  getCt_sindicatos!: Sequelize.HasManyGetAssociationsMixin<ct_sindicato>;
  setCt_sindicatos!: Sequelize.HasManySetAssociationsMixin<ct_sindicato, ct_sindicatoId>;
  addCt_sindicato!: Sequelize.HasManyAddAssociationMixin<ct_sindicato, ct_sindicatoId>;
  addCt_sindicatos!: Sequelize.HasManyAddAssociationsMixin<ct_sindicato, ct_sindicatoId>;
  createCt_sindicato!: Sequelize.HasManyCreateAssociationMixin<ct_sindicato>;
  removeCt_sindicato!: Sequelize.HasManyRemoveAssociationMixin<ct_sindicato, ct_sindicatoId>;
  removeCt_sindicatos!: Sequelize.HasManyRemoveAssociationsMixin<ct_sindicato, ct_sindicatoId>;
  hasCt_sindicato!: Sequelize.HasManyHasAssociationMixin<ct_sindicato, ct_sindicatoId>;
  hasCt_sindicatos!: Sequelize.HasManyHasAssociationsMixin<ct_sindicato, ct_sindicatoId>;
  countCt_sindicatos!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany ct_sindicato via ct_usuario_at
  ct_usuario_at_ct_sindicatos!: ct_sindicato[];
  getCt_usuario_at_ct_sindicatos!: Sequelize.HasManyGetAssociationsMixin<ct_sindicato>;
  setCt_usuario_at_ct_sindicatos!: Sequelize.HasManySetAssociationsMixin<ct_sindicato, ct_sindicatoId>;
  addCt_usuario_at_ct_sindicato!: Sequelize.HasManyAddAssociationMixin<ct_sindicato, ct_sindicatoId>;
  addCt_usuario_at_ct_sindicatos!: Sequelize.HasManyAddAssociationsMixin<ct_sindicato, ct_sindicatoId>;
  createCt_usuario_at_ct_sindicato!: Sequelize.HasManyCreateAssociationMixin<ct_sindicato>;
  removeCt_usuario_at_ct_sindicato!: Sequelize.HasManyRemoveAssociationMixin<ct_sindicato, ct_sindicatoId>;
  removeCt_usuario_at_ct_sindicatos!: Sequelize.HasManyRemoveAssociationsMixin<ct_sindicato, ct_sindicatoId>;
  hasCt_usuario_at_ct_sindicato!: Sequelize.HasManyHasAssociationMixin<ct_sindicato, ct_sindicatoId>;
  hasCt_usuario_at_ct_sindicatos!: Sequelize.HasManyHasAssociationsMixin<ct_sindicato, ct_sindicatoId>;
  countCt_usuario_at_ct_sindicatos!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario belongsTo ct_usuario via ct_usuario_in
  ct_usuario_in_ct_usuario!: ct_usuario;
  getCt_usuario_in_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_in_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_in_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // ct_usuario belongsTo ct_usuario via ct_usuario_at
  ct_usuario_at_ct_usuario!: ct_usuario;
  getCt_usuario_at_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_at_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_at_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // ct_usuario hasMany dt_aspirante_aneec via ct_usuario_in
  dt_aspirante_aneecs!: dt_aspirante_aneec[];
  getDt_aspirante_aneecs!: Sequelize.HasManyGetAssociationsMixin<dt_aspirante_aneec>;
  setDt_aspirante_aneecs!: Sequelize.HasManySetAssociationsMixin<dt_aspirante_aneec, dt_aspirante_aneecId>;
  addDt_aspirante_aneec!: Sequelize.HasManyAddAssociationMixin<dt_aspirante_aneec, dt_aspirante_aneecId>;
  addDt_aspirante_aneecs!: Sequelize.HasManyAddAssociationsMixin<dt_aspirante_aneec, dt_aspirante_aneecId>;
  createDt_aspirante_aneec!: Sequelize.HasManyCreateAssociationMixin<dt_aspirante_aneec>;
  removeDt_aspirante_aneec!: Sequelize.HasManyRemoveAssociationMixin<dt_aspirante_aneec, dt_aspirante_aneecId>;
  removeDt_aspirante_aneecs!: Sequelize.HasManyRemoveAssociationsMixin<dt_aspirante_aneec, dt_aspirante_aneecId>;
  hasDt_aspirante_aneec!: Sequelize.HasManyHasAssociationMixin<dt_aspirante_aneec, dt_aspirante_aneecId>;
  hasDt_aspirante_aneecs!: Sequelize.HasManyHasAssociationsMixin<dt_aspirante_aneec, dt_aspirante_aneecId>;
  countDt_aspirante_aneecs!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany dt_aspirante_aneec via ct_usuario_at
  ct_usuario_at_dt_aspirante_aneecs!: dt_aspirante_aneec[];
  getCt_usuario_at_dt_aspirante_aneecs!: Sequelize.HasManyGetAssociationsMixin<dt_aspirante_aneec>;
  setCt_usuario_at_dt_aspirante_aneecs!: Sequelize.HasManySetAssociationsMixin<dt_aspirante_aneec, dt_aspirante_aneecId>;
  addCt_usuario_at_dt_aspirante_aneec!: Sequelize.HasManyAddAssociationMixin<dt_aspirante_aneec, dt_aspirante_aneecId>;
  addCt_usuario_at_dt_aspirante_aneecs!: Sequelize.HasManyAddAssociationsMixin<dt_aspirante_aneec, dt_aspirante_aneecId>;
  createCt_usuario_at_dt_aspirante_aneec!: Sequelize.HasManyCreateAssociationMixin<dt_aspirante_aneec>;
  removeCt_usuario_at_dt_aspirante_aneec!: Sequelize.HasManyRemoveAssociationMixin<dt_aspirante_aneec, dt_aspirante_aneecId>;
  removeCt_usuario_at_dt_aspirante_aneecs!: Sequelize.HasManyRemoveAssociationsMixin<dt_aspirante_aneec, dt_aspirante_aneecId>;
  hasCt_usuario_at_dt_aspirante_aneec!: Sequelize.HasManyHasAssociationMixin<dt_aspirante_aneec, dt_aspirante_aneecId>;
  hasCt_usuario_at_dt_aspirante_aneecs!: Sequelize.HasManyHasAssociationsMixin<dt_aspirante_aneec, dt_aspirante_aneecId>;
  countCt_usuario_at_dt_aspirante_aneecs!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany dt_bitacora via ct_usuario_id
  dt_bitacoras!: dt_bitacora[];
  getDt_bitacoras!: Sequelize.HasManyGetAssociationsMixin<dt_bitacora>;
  setDt_bitacoras!: Sequelize.HasManySetAssociationsMixin<dt_bitacora, dt_bitacoraId>;
  addDt_bitacora!: Sequelize.HasManyAddAssociationMixin<dt_bitacora, dt_bitacoraId>;
  addDt_bitacoras!: Sequelize.HasManyAddAssociationsMixin<dt_bitacora, dt_bitacoraId>;
  createDt_bitacora!: Sequelize.HasManyCreateAssociationMixin<dt_bitacora>;
  removeDt_bitacora!: Sequelize.HasManyRemoveAssociationMixin<dt_bitacora, dt_bitacoraId>;
  removeDt_bitacoras!: Sequelize.HasManyRemoveAssociationsMixin<dt_bitacora, dt_bitacoraId>;
  hasDt_bitacora!: Sequelize.HasManyHasAssociationMixin<dt_bitacora, dt_bitacoraId>;
  hasDt_bitacoras!: Sequelize.HasManyHasAssociationsMixin<dt_bitacora, dt_bitacoraId>;
  countDt_bitacoras!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany dt_consumible_entrega via ct_usuario_id
  dt_consumible_entregas!: dt_consumible_entrega[];
  getDt_consumible_entregas!: Sequelize.HasManyGetAssociationsMixin<dt_consumible_entrega>;
  setDt_consumible_entregas!: Sequelize.HasManySetAssociationsMixin<dt_consumible_entrega, dt_consumible_entregaId>;
  addDt_consumible_entrega!: Sequelize.HasManyAddAssociationMixin<dt_consumible_entrega, dt_consumible_entregaId>;
  addDt_consumible_entregas!: Sequelize.HasManyAddAssociationsMixin<dt_consumible_entrega, dt_consumible_entregaId>;
  createDt_consumible_entrega!: Sequelize.HasManyCreateAssociationMixin<dt_consumible_entrega>;
  removeDt_consumible_entrega!: Sequelize.HasManyRemoveAssociationMixin<dt_consumible_entrega, dt_consumible_entregaId>;
  removeDt_consumible_entregas!: Sequelize.HasManyRemoveAssociationsMixin<dt_consumible_entrega, dt_consumible_entregaId>;
  hasDt_consumible_entrega!: Sequelize.HasManyHasAssociationMixin<dt_consumible_entrega, dt_consumible_entregaId>;
  hasDt_consumible_entregas!: Sequelize.HasManyHasAssociationsMixin<dt_consumible_entrega, dt_consumible_entregaId>;
  countDt_consumible_entregas!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany dt_correspondencia via ct_usuarios_in
  dt_correspondencia!: dt_correspondencia[];
  getDt_correspondencia!: Sequelize.HasManyGetAssociationsMixin<dt_correspondencia>;
  setDt_correspondencia!: Sequelize.HasManySetAssociationsMixin<dt_correspondencia, dt_correspondenciaId>;
  addDt_correspondencium!: Sequelize.HasManyAddAssociationMixin<dt_correspondencia, dt_correspondenciaId>;
  addDt_correspondencia!: Sequelize.HasManyAddAssociationsMixin<dt_correspondencia, dt_correspondenciaId>;
  createDt_correspondencium!: Sequelize.HasManyCreateAssociationMixin<dt_correspondencia>;
  removeDt_correspondencium!: Sequelize.HasManyRemoveAssociationMixin<dt_correspondencia, dt_correspondenciaId>;
  removeDt_correspondencia!: Sequelize.HasManyRemoveAssociationsMixin<dt_correspondencia, dt_correspondenciaId>;
  hasDt_correspondencium!: Sequelize.HasManyHasAssociationMixin<dt_correspondencia, dt_correspondenciaId>;
  hasDt_correspondencia!: Sequelize.HasManyHasAssociationsMixin<dt_correspondencia, dt_correspondenciaId>;
  countDt_correspondencia!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany dt_diagnostico_aneec via ct_usuario_in
  dt_diagnostico_aneecs!: dt_diagnostico_aneec[];
  getDt_diagnostico_aneecs!: Sequelize.HasManyGetAssociationsMixin<dt_diagnostico_aneec>;
  setDt_diagnostico_aneecs!: Sequelize.HasManySetAssociationsMixin<dt_diagnostico_aneec, dt_diagnostico_aneecId>;
  addDt_diagnostico_aneec!: Sequelize.HasManyAddAssociationMixin<dt_diagnostico_aneec, dt_diagnostico_aneecId>;
  addDt_diagnostico_aneecs!: Sequelize.HasManyAddAssociationsMixin<dt_diagnostico_aneec, dt_diagnostico_aneecId>;
  createDt_diagnostico_aneec!: Sequelize.HasManyCreateAssociationMixin<dt_diagnostico_aneec>;
  removeDt_diagnostico_aneec!: Sequelize.HasManyRemoveAssociationMixin<dt_diagnostico_aneec, dt_diagnostico_aneecId>;
  removeDt_diagnostico_aneecs!: Sequelize.HasManyRemoveAssociationsMixin<dt_diagnostico_aneec, dt_diagnostico_aneecId>;
  hasDt_diagnostico_aneec!: Sequelize.HasManyHasAssociationMixin<dt_diagnostico_aneec, dt_diagnostico_aneecId>;
  hasDt_diagnostico_aneecs!: Sequelize.HasManyHasAssociationsMixin<dt_diagnostico_aneec, dt_diagnostico_aneecId>;
  countDt_diagnostico_aneecs!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany dt_diagnostico_aneec via ct_usuario_at
  ct_usuario_at_dt_diagnostico_aneecs!: dt_diagnostico_aneec[];
  getCt_usuario_at_dt_diagnostico_aneecs!: Sequelize.HasManyGetAssociationsMixin<dt_diagnostico_aneec>;
  setCt_usuario_at_dt_diagnostico_aneecs!: Sequelize.HasManySetAssociationsMixin<dt_diagnostico_aneec, dt_diagnostico_aneecId>;
  addCt_usuario_at_dt_diagnostico_aneec!: Sequelize.HasManyAddAssociationMixin<dt_diagnostico_aneec, dt_diagnostico_aneecId>;
  addCt_usuario_at_dt_diagnostico_aneecs!: Sequelize.HasManyAddAssociationsMixin<dt_diagnostico_aneec, dt_diagnostico_aneecId>;
  createCt_usuario_at_dt_diagnostico_aneec!: Sequelize.HasManyCreateAssociationMixin<dt_diagnostico_aneec>;
  removeCt_usuario_at_dt_diagnostico_aneec!: Sequelize.HasManyRemoveAssociationMixin<dt_diagnostico_aneec, dt_diagnostico_aneecId>;
  removeCt_usuario_at_dt_diagnostico_aneecs!: Sequelize.HasManyRemoveAssociationsMixin<dt_diagnostico_aneec, dt_diagnostico_aneecId>;
  hasCt_usuario_at_dt_diagnostico_aneec!: Sequelize.HasManyHasAssociationMixin<dt_diagnostico_aneec, dt_diagnostico_aneecId>;
  hasCt_usuario_at_dt_diagnostico_aneecs!: Sequelize.HasManyHasAssociationsMixin<dt_diagnostico_aneec, dt_diagnostico_aneecId>;
  countCt_usuario_at_dt_diagnostico_aneecs!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany dt_dictamen_escalafon via ct_usuario_in
  dt_dictamen_escalafons!: dt_dictamen_escalafon[];
  getDt_dictamen_escalafons!: Sequelize.HasManyGetAssociationsMixin<dt_dictamen_escalafon>;
  setDt_dictamen_escalafons!: Sequelize.HasManySetAssociationsMixin<dt_dictamen_escalafon, dt_dictamen_escalafonId>;
  addDt_dictamen_escalafon!: Sequelize.HasManyAddAssociationMixin<dt_dictamen_escalafon, dt_dictamen_escalafonId>;
  addDt_dictamen_escalafons!: Sequelize.HasManyAddAssociationsMixin<dt_dictamen_escalafon, dt_dictamen_escalafonId>;
  createDt_dictamen_escalafon!: Sequelize.HasManyCreateAssociationMixin<dt_dictamen_escalafon>;
  removeDt_dictamen_escalafon!: Sequelize.HasManyRemoveAssociationMixin<dt_dictamen_escalafon, dt_dictamen_escalafonId>;
  removeDt_dictamen_escalafons!: Sequelize.HasManyRemoveAssociationsMixin<dt_dictamen_escalafon, dt_dictamen_escalafonId>;
  hasDt_dictamen_escalafon!: Sequelize.HasManyHasAssociationMixin<dt_dictamen_escalafon, dt_dictamen_escalafonId>;
  hasDt_dictamen_escalafons!: Sequelize.HasManyHasAssociationsMixin<dt_dictamen_escalafon, dt_dictamen_escalafonId>;
  countDt_dictamen_escalafons!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany dt_dictamen_escalafon via ct_usuario_at
  ct_usuario_at_dt_dictamen_escalafons!: dt_dictamen_escalafon[];
  getCt_usuario_at_dt_dictamen_escalafons!: Sequelize.HasManyGetAssociationsMixin<dt_dictamen_escalafon>;
  setCt_usuario_at_dt_dictamen_escalafons!: Sequelize.HasManySetAssociationsMixin<dt_dictamen_escalafon, dt_dictamen_escalafonId>;
  addCt_usuario_at_dt_dictamen_escalafon!: Sequelize.HasManyAddAssociationMixin<dt_dictamen_escalafon, dt_dictamen_escalafonId>;
  addCt_usuario_at_dt_dictamen_escalafons!: Sequelize.HasManyAddAssociationsMixin<dt_dictamen_escalafon, dt_dictamen_escalafonId>;
  createCt_usuario_at_dt_dictamen_escalafon!: Sequelize.HasManyCreateAssociationMixin<dt_dictamen_escalafon>;
  removeCt_usuario_at_dt_dictamen_escalafon!: Sequelize.HasManyRemoveAssociationMixin<dt_dictamen_escalafon, dt_dictamen_escalafonId>;
  removeCt_usuario_at_dt_dictamen_escalafons!: Sequelize.HasManyRemoveAssociationsMixin<dt_dictamen_escalafon, dt_dictamen_escalafonId>;
  hasCt_usuario_at_dt_dictamen_escalafon!: Sequelize.HasManyHasAssociationMixin<dt_dictamen_escalafon, dt_dictamen_escalafonId>;
  hasCt_usuario_at_dt_dictamen_escalafons!: Sequelize.HasManyHasAssociationsMixin<dt_dictamen_escalafon, dt_dictamen_escalafonId>;
  countCt_usuario_at_dt_dictamen_escalafons!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany dt_funcion via ct_usuario_in
  dt_funcions!: dt_funcion[];
  getDt_funcions!: Sequelize.HasManyGetAssociationsMixin<dt_funcion>;
  setDt_funcions!: Sequelize.HasManySetAssociationsMixin<dt_funcion, dt_funcionId>;
  addDt_funcion!: Sequelize.HasManyAddAssociationMixin<dt_funcion, dt_funcionId>;
  addDt_funcions!: Sequelize.HasManyAddAssociationsMixin<dt_funcion, dt_funcionId>;
  createDt_funcion!: Sequelize.HasManyCreateAssociationMixin<dt_funcion>;
  removeDt_funcion!: Sequelize.HasManyRemoveAssociationMixin<dt_funcion, dt_funcionId>;
  removeDt_funcions!: Sequelize.HasManyRemoveAssociationsMixin<dt_funcion, dt_funcionId>;
  hasDt_funcion!: Sequelize.HasManyHasAssociationMixin<dt_funcion, dt_funcionId>;
  hasDt_funcions!: Sequelize.HasManyHasAssociationsMixin<dt_funcion, dt_funcionId>;
  countDt_funcions!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany dt_funcion via ct_usuario_at
  ct_usuario_at_dt_funcions!: dt_funcion[];
  getCt_usuario_at_dt_funcions!: Sequelize.HasManyGetAssociationsMixin<dt_funcion>;
  setCt_usuario_at_dt_funcions!: Sequelize.HasManySetAssociationsMixin<dt_funcion, dt_funcionId>;
  addCt_usuario_at_dt_funcion!: Sequelize.HasManyAddAssociationMixin<dt_funcion, dt_funcionId>;
  addCt_usuario_at_dt_funcions!: Sequelize.HasManyAddAssociationsMixin<dt_funcion, dt_funcionId>;
  createCt_usuario_at_dt_funcion!: Sequelize.HasManyCreateAssociationMixin<dt_funcion>;
  removeCt_usuario_at_dt_funcion!: Sequelize.HasManyRemoveAssociationMixin<dt_funcion, dt_funcionId>;
  removeCt_usuario_at_dt_funcions!: Sequelize.HasManyRemoveAssociationsMixin<dt_funcion, dt_funcionId>;
  hasCt_usuario_at_dt_funcion!: Sequelize.HasManyHasAssociationMixin<dt_funcion, dt_funcionId>;
  hasCt_usuario_at_dt_funcions!: Sequelize.HasManyHasAssociationsMixin<dt_funcion, dt_funcionId>;
  countCt_usuario_at_dt_funcions!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany dt_informes_aneec via ct_usuario_in
  dt_informes_aneecs!: dt_informes_aneec[];
  getDt_informes_aneecs!: Sequelize.HasManyGetAssociationsMixin<dt_informes_aneec>;
  setDt_informes_aneecs!: Sequelize.HasManySetAssociationsMixin<dt_informes_aneec, dt_informes_aneecId>;
  addDt_informes_aneec!: Sequelize.HasManyAddAssociationMixin<dt_informes_aneec, dt_informes_aneecId>;
  addDt_informes_aneecs!: Sequelize.HasManyAddAssociationsMixin<dt_informes_aneec, dt_informes_aneecId>;
  createDt_informes_aneec!: Sequelize.HasManyCreateAssociationMixin<dt_informes_aneec>;
  removeDt_informes_aneec!: Sequelize.HasManyRemoveAssociationMixin<dt_informes_aneec, dt_informes_aneecId>;
  removeDt_informes_aneecs!: Sequelize.HasManyRemoveAssociationsMixin<dt_informes_aneec, dt_informes_aneecId>;
  hasDt_informes_aneec!: Sequelize.HasManyHasAssociationMixin<dt_informes_aneec, dt_informes_aneecId>;
  hasDt_informes_aneecs!: Sequelize.HasManyHasAssociationsMixin<dt_informes_aneec, dt_informes_aneecId>;
  countDt_informes_aneecs!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany dt_informes_aneec via ct_usuario_at
  ct_usuario_at_dt_informes_aneecs!: dt_informes_aneec[];
  getCt_usuario_at_dt_informes_aneecs!: Sequelize.HasManyGetAssociationsMixin<dt_informes_aneec>;
  setCt_usuario_at_dt_informes_aneecs!: Sequelize.HasManySetAssociationsMixin<dt_informes_aneec, dt_informes_aneecId>;
  addCt_usuario_at_dt_informes_aneec!: Sequelize.HasManyAddAssociationMixin<dt_informes_aneec, dt_informes_aneecId>;
  addCt_usuario_at_dt_informes_aneecs!: Sequelize.HasManyAddAssociationsMixin<dt_informes_aneec, dt_informes_aneecId>;
  createCt_usuario_at_dt_informes_aneec!: Sequelize.HasManyCreateAssociationMixin<dt_informes_aneec>;
  removeCt_usuario_at_dt_informes_aneec!: Sequelize.HasManyRemoveAssociationMixin<dt_informes_aneec, dt_informes_aneecId>;
  removeCt_usuario_at_dt_informes_aneecs!: Sequelize.HasManyRemoveAssociationsMixin<dt_informes_aneec, dt_informes_aneecId>;
  hasCt_usuario_at_dt_informes_aneec!: Sequelize.HasManyHasAssociationMixin<dt_informes_aneec, dt_informes_aneecId>;
  hasCt_usuario_at_dt_informes_aneecs!: Sequelize.HasManyHasAssociationsMixin<dt_informes_aneec, dt_informes_aneecId>;
  countCt_usuario_at_dt_informes_aneecs!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany dt_planeaciones_aneec via ct_usuario_in
  dt_planeaciones_aneecs!: dt_planeaciones_aneec[];
  getDt_planeaciones_aneecs!: Sequelize.HasManyGetAssociationsMixin<dt_planeaciones_aneec>;
  setDt_planeaciones_aneecs!: Sequelize.HasManySetAssociationsMixin<dt_planeaciones_aneec, dt_planeaciones_aneecId>;
  addDt_planeaciones_aneec!: Sequelize.HasManyAddAssociationMixin<dt_planeaciones_aneec, dt_planeaciones_aneecId>;
  addDt_planeaciones_aneecs!: Sequelize.HasManyAddAssociationsMixin<dt_planeaciones_aneec, dt_planeaciones_aneecId>;
  createDt_planeaciones_aneec!: Sequelize.HasManyCreateAssociationMixin<dt_planeaciones_aneec>;
  removeDt_planeaciones_aneec!: Sequelize.HasManyRemoveAssociationMixin<dt_planeaciones_aneec, dt_planeaciones_aneecId>;
  removeDt_planeaciones_aneecs!: Sequelize.HasManyRemoveAssociationsMixin<dt_planeaciones_aneec, dt_planeaciones_aneecId>;
  hasDt_planeaciones_aneec!: Sequelize.HasManyHasAssociationMixin<dt_planeaciones_aneec, dt_planeaciones_aneecId>;
  hasDt_planeaciones_aneecs!: Sequelize.HasManyHasAssociationsMixin<dt_planeaciones_aneec, dt_planeaciones_aneecId>;
  countDt_planeaciones_aneecs!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany dt_planeaciones_aneec via ct_usuario_at
  ct_usuario_at_dt_planeaciones_aneecs!: dt_planeaciones_aneec[];
  getCt_usuario_at_dt_planeaciones_aneecs!: Sequelize.HasManyGetAssociationsMixin<dt_planeaciones_aneec>;
  setCt_usuario_at_dt_planeaciones_aneecs!: Sequelize.HasManySetAssociationsMixin<dt_planeaciones_aneec, dt_planeaciones_aneecId>;
  addCt_usuario_at_dt_planeaciones_aneec!: Sequelize.HasManyAddAssociationMixin<dt_planeaciones_aneec, dt_planeaciones_aneecId>;
  addCt_usuario_at_dt_planeaciones_aneecs!: Sequelize.HasManyAddAssociationsMixin<dt_planeaciones_aneec, dt_planeaciones_aneecId>;
  createCt_usuario_at_dt_planeaciones_aneec!: Sequelize.HasManyCreateAssociationMixin<dt_planeaciones_aneec>;
  removeCt_usuario_at_dt_planeaciones_aneec!: Sequelize.HasManyRemoveAssociationMixin<dt_planeaciones_aneec, dt_planeaciones_aneecId>;
  removeCt_usuario_at_dt_planeaciones_aneecs!: Sequelize.HasManyRemoveAssociationsMixin<dt_planeaciones_aneec, dt_planeaciones_aneecId>;
  hasCt_usuario_at_dt_planeaciones_aneec!: Sequelize.HasManyHasAssociationMixin<dt_planeaciones_aneec, dt_planeaciones_aneecId>;
  hasCt_usuario_at_dt_planeaciones_aneecs!: Sequelize.HasManyHasAssociationsMixin<dt_planeaciones_aneec, dt_planeaciones_aneecId>;
  countCt_usuario_at_dt_planeaciones_aneecs!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany dt_techo_presupuesto via ct_usuario_in
  dt_techo_presupuestos!: dt_techo_presupuesto[];
  getDt_techo_presupuestos!: Sequelize.HasManyGetAssociationsMixin<dt_techo_presupuesto>;
  setDt_techo_presupuestos!: Sequelize.HasManySetAssociationsMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  addDt_techo_presupuesto!: Sequelize.HasManyAddAssociationMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  addDt_techo_presupuestos!: Sequelize.HasManyAddAssociationsMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  createDt_techo_presupuesto!: Sequelize.HasManyCreateAssociationMixin<dt_techo_presupuesto>;
  removeDt_techo_presupuesto!: Sequelize.HasManyRemoveAssociationMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  removeDt_techo_presupuestos!: Sequelize.HasManyRemoveAssociationsMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  hasDt_techo_presupuesto!: Sequelize.HasManyHasAssociationMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  hasDt_techo_presupuestos!: Sequelize.HasManyHasAssociationsMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  countDt_techo_presupuestos!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany dt_techo_presupuesto via ct_usuario_at
  ct_usuario_at_dt_techo_presupuestos!: dt_techo_presupuesto[];
  getCt_usuario_at_dt_techo_presupuestos!: Sequelize.HasManyGetAssociationsMixin<dt_techo_presupuesto>;
  setCt_usuario_at_dt_techo_presupuestos!: Sequelize.HasManySetAssociationsMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  addCt_usuario_at_dt_techo_presupuesto!: Sequelize.HasManyAddAssociationMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  addCt_usuario_at_dt_techo_presupuestos!: Sequelize.HasManyAddAssociationsMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  createCt_usuario_at_dt_techo_presupuesto!: Sequelize.HasManyCreateAssociationMixin<dt_techo_presupuesto>;
  removeCt_usuario_at_dt_techo_presupuesto!: Sequelize.HasManyRemoveAssociationMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  removeCt_usuario_at_dt_techo_presupuestos!: Sequelize.HasManyRemoveAssociationsMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  hasCt_usuario_at_dt_techo_presupuesto!: Sequelize.HasManyHasAssociationMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  hasCt_usuario_at_dt_techo_presupuestos!: Sequelize.HasManyHasAssociationsMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  countCt_usuario_at_dt_techo_presupuestos!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany rl_analista_unidad via ct_usuario_id
  rl_analista_unidads!: rl_analista_unidad[];
  getRl_analista_unidads!: Sequelize.HasManyGetAssociationsMixin<rl_analista_unidad>;
  setRl_analista_unidads!: Sequelize.HasManySetAssociationsMixin<rl_analista_unidad, rl_analista_unidadId>;
  addRl_analista_unidad!: Sequelize.HasManyAddAssociationMixin<rl_analista_unidad, rl_analista_unidadId>;
  addRl_analista_unidads!: Sequelize.HasManyAddAssociationsMixin<rl_analista_unidad, rl_analista_unidadId>;
  createRl_analista_unidad!: Sequelize.HasManyCreateAssociationMixin<rl_analista_unidad>;
  removeRl_analista_unidad!: Sequelize.HasManyRemoveAssociationMixin<rl_analista_unidad, rl_analista_unidadId>;
  removeRl_analista_unidads!: Sequelize.HasManyRemoveAssociationsMixin<rl_analista_unidad, rl_analista_unidadId>;
  hasRl_analista_unidad!: Sequelize.HasManyHasAssociationMixin<rl_analista_unidad, rl_analista_unidadId>;
  hasRl_analista_unidads!: Sequelize.HasManyHasAssociationsMixin<rl_analista_unidad, rl_analista_unidadId>;
  countRl_analista_unidads!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany rl_analista_unidad via ct_usuario_in
  ct_usuario_in_rl_analista_unidads!: rl_analista_unidad[];
  getCt_usuario_in_rl_analista_unidads!: Sequelize.HasManyGetAssociationsMixin<rl_analista_unidad>;
  setCt_usuario_in_rl_analista_unidads!: Sequelize.HasManySetAssociationsMixin<rl_analista_unidad, rl_analista_unidadId>;
  addCt_usuario_in_rl_analista_unidad!: Sequelize.HasManyAddAssociationMixin<rl_analista_unidad, rl_analista_unidadId>;
  addCt_usuario_in_rl_analista_unidads!: Sequelize.HasManyAddAssociationsMixin<rl_analista_unidad, rl_analista_unidadId>;
  createCt_usuario_in_rl_analista_unidad!: Sequelize.HasManyCreateAssociationMixin<rl_analista_unidad>;
  removeCt_usuario_in_rl_analista_unidad!: Sequelize.HasManyRemoveAssociationMixin<rl_analista_unidad, rl_analista_unidadId>;
  removeCt_usuario_in_rl_analista_unidads!: Sequelize.HasManyRemoveAssociationsMixin<rl_analista_unidad, rl_analista_unidadId>;
  hasCt_usuario_in_rl_analista_unidad!: Sequelize.HasManyHasAssociationMixin<rl_analista_unidad, rl_analista_unidadId>;
  hasCt_usuario_in_rl_analista_unidads!: Sequelize.HasManyHasAssociationsMixin<rl_analista_unidad, rl_analista_unidadId>;
  countCt_usuario_in_rl_analista_unidads!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany rl_area_financiero via ct_usuario_in
  rl_area_financieros!: rl_area_financiero[];
  getRl_area_financieros!: Sequelize.HasManyGetAssociationsMixin<rl_area_financiero>;
  setRl_area_financieros!: Sequelize.HasManySetAssociationsMixin<rl_area_financiero, rl_area_financieroId>;
  addRl_area_financiero!: Sequelize.HasManyAddAssociationMixin<rl_area_financiero, rl_area_financieroId>;
  addRl_area_financieros!: Sequelize.HasManyAddAssociationsMixin<rl_area_financiero, rl_area_financieroId>;
  createRl_area_financiero!: Sequelize.HasManyCreateAssociationMixin<rl_area_financiero>;
  removeRl_area_financiero!: Sequelize.HasManyRemoveAssociationMixin<rl_area_financiero, rl_area_financieroId>;
  removeRl_area_financieros!: Sequelize.HasManyRemoveAssociationsMixin<rl_area_financiero, rl_area_financieroId>;
  hasRl_area_financiero!: Sequelize.HasManyHasAssociationMixin<rl_area_financiero, rl_area_financieroId>;
  hasRl_area_financieros!: Sequelize.HasManyHasAssociationsMixin<rl_area_financiero, rl_area_financieroId>;
  countRl_area_financieros!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany rl_area_financiero via ct_usuario_at
  ct_usuario_at_rl_area_financieros!: rl_area_financiero[];
  getCt_usuario_at_rl_area_financieros!: Sequelize.HasManyGetAssociationsMixin<rl_area_financiero>;
  setCt_usuario_at_rl_area_financieros!: Sequelize.HasManySetAssociationsMixin<rl_area_financiero, rl_area_financieroId>;
  addCt_usuario_at_rl_area_financiero!: Sequelize.HasManyAddAssociationMixin<rl_area_financiero, rl_area_financieroId>;
  addCt_usuario_at_rl_area_financieros!: Sequelize.HasManyAddAssociationsMixin<rl_area_financiero, rl_area_financieroId>;
  createCt_usuario_at_rl_area_financiero!: Sequelize.HasManyCreateAssociationMixin<rl_area_financiero>;
  removeCt_usuario_at_rl_area_financiero!: Sequelize.HasManyRemoveAssociationMixin<rl_area_financiero, rl_area_financieroId>;
  removeCt_usuario_at_rl_area_financieros!: Sequelize.HasManyRemoveAssociationsMixin<rl_area_financiero, rl_area_financieroId>;
  hasCt_usuario_at_rl_area_financiero!: Sequelize.HasManyHasAssociationMixin<rl_area_financiero, rl_area_financieroId>;
  hasCt_usuario_at_rl_area_financieros!: Sequelize.HasManyHasAssociationsMixin<rl_area_financiero, rl_area_financieroId>;
  countCt_usuario_at_rl_area_financieros!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany rl_correspondencia_usuario_estado via ct_usuarios_in
  rl_correspondencia_usuario_estados!: rl_correspondencia_usuario_estado[];
  getRl_correspondencia_usuario_estados!: Sequelize.HasManyGetAssociationsMixin<rl_correspondencia_usuario_estado>;
  setRl_correspondencia_usuario_estados!: Sequelize.HasManySetAssociationsMixin<rl_correspondencia_usuario_estado, rl_correspondencia_usuario_estadoId>;
  addRl_correspondencia_usuario_estado!: Sequelize.HasManyAddAssociationMixin<rl_correspondencia_usuario_estado, rl_correspondencia_usuario_estadoId>;
  addRl_correspondencia_usuario_estados!: Sequelize.HasManyAddAssociationsMixin<rl_correspondencia_usuario_estado, rl_correspondencia_usuario_estadoId>;
  createRl_correspondencia_usuario_estado!: Sequelize.HasManyCreateAssociationMixin<rl_correspondencia_usuario_estado>;
  removeRl_correspondencia_usuario_estado!: Sequelize.HasManyRemoveAssociationMixin<rl_correspondencia_usuario_estado, rl_correspondencia_usuario_estadoId>;
  removeRl_correspondencia_usuario_estados!: Sequelize.HasManyRemoveAssociationsMixin<rl_correspondencia_usuario_estado, rl_correspondencia_usuario_estadoId>;
  hasRl_correspondencia_usuario_estado!: Sequelize.HasManyHasAssociationMixin<rl_correspondencia_usuario_estado, rl_correspondencia_usuario_estadoId>;
  hasRl_correspondencia_usuario_estados!: Sequelize.HasManyHasAssociationsMixin<rl_correspondencia_usuario_estado, rl_correspondencia_usuario_estadoId>;
  countRl_correspondencia_usuario_estados!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany rl_entrega_formato via ct_usuario_id
  rl_entrega_formatos!: rl_entrega_formato[];
  getRl_entrega_formatos!: Sequelize.HasManyGetAssociationsMixin<rl_entrega_formato>;
  setRl_entrega_formatos!: Sequelize.HasManySetAssociationsMixin<rl_entrega_formato, rl_entrega_formatoId>;
  addRl_entrega_formato!: Sequelize.HasManyAddAssociationMixin<rl_entrega_formato, rl_entrega_formatoId>;
  addRl_entrega_formatos!: Sequelize.HasManyAddAssociationsMixin<rl_entrega_formato, rl_entrega_formatoId>;
  createRl_entrega_formato!: Sequelize.HasManyCreateAssociationMixin<rl_entrega_formato>;
  removeRl_entrega_formato!: Sequelize.HasManyRemoveAssociationMixin<rl_entrega_formato, rl_entrega_formatoId>;
  removeRl_entrega_formatos!: Sequelize.HasManyRemoveAssociationsMixin<rl_entrega_formato, rl_entrega_formatoId>;
  hasRl_entrega_formato!: Sequelize.HasManyHasAssociationMixin<rl_entrega_formato, rl_entrega_formatoId>;
  hasRl_entrega_formatos!: Sequelize.HasManyHasAssociationsMixin<rl_entrega_formato, rl_entrega_formatoId>;
  countRl_entrega_formatos!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany rl_justificacion via ct_usuario_id
  rl_justificacions!: rl_justificacion[];
  getRl_justificacions!: Sequelize.HasManyGetAssociationsMixin<rl_justificacion>;
  setRl_justificacions!: Sequelize.HasManySetAssociationsMixin<rl_justificacion, rl_justificacionId>;
  addRl_justificacion!: Sequelize.HasManyAddAssociationMixin<rl_justificacion, rl_justificacionId>;
  addRl_justificacions!: Sequelize.HasManyAddAssociationsMixin<rl_justificacion, rl_justificacionId>;
  createRl_justificacion!: Sequelize.HasManyCreateAssociationMixin<rl_justificacion>;
  removeRl_justificacion!: Sequelize.HasManyRemoveAssociationMixin<rl_justificacion, rl_justificacionId>;
  removeRl_justificacions!: Sequelize.HasManyRemoveAssociationsMixin<rl_justificacion, rl_justificacionId>;
  hasRl_justificacion!: Sequelize.HasManyHasAssociationMixin<rl_justificacion, rl_justificacionId>;
  hasRl_justificacions!: Sequelize.HasManyHasAssociationsMixin<rl_justificacion, rl_justificacionId>;
  countRl_justificacions!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany rl_producto_requisicion via ct_usuarios_in
  rl_producto_requisicions!: rl_producto_requisicion[];
  getRl_producto_requisicions!: Sequelize.HasManyGetAssociationsMixin<rl_producto_requisicion>;
  setRl_producto_requisicions!: Sequelize.HasManySetAssociationsMixin<rl_producto_requisicion, rl_producto_requisicionId>;
  addRl_producto_requisicion!: Sequelize.HasManyAddAssociationMixin<rl_producto_requisicion, rl_producto_requisicionId>;
  addRl_producto_requisicions!: Sequelize.HasManyAddAssociationsMixin<rl_producto_requisicion, rl_producto_requisicionId>;
  createRl_producto_requisicion!: Sequelize.HasManyCreateAssociationMixin<rl_producto_requisicion>;
  removeRl_producto_requisicion!: Sequelize.HasManyRemoveAssociationMixin<rl_producto_requisicion, rl_producto_requisicionId>;
  removeRl_producto_requisicions!: Sequelize.HasManyRemoveAssociationsMixin<rl_producto_requisicion, rl_producto_requisicionId>;
  hasRl_producto_requisicion!: Sequelize.HasManyHasAssociationMixin<rl_producto_requisicion, rl_producto_requisicionId>;
  hasRl_producto_requisicions!: Sequelize.HasManyHasAssociationsMixin<rl_producto_requisicion, rl_producto_requisicionId>;
  countRl_producto_requisicions!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany rl_usuario_funcion via ct_usuario_id
  rl_usuario_funcions!: rl_usuario_funcion[];
  getRl_usuario_funcions!: Sequelize.HasManyGetAssociationsMixin<rl_usuario_funcion>;
  setRl_usuario_funcions!: Sequelize.HasManySetAssociationsMixin<rl_usuario_funcion, rl_usuario_funcionId>;
  addRl_usuario_funcion!: Sequelize.HasManyAddAssociationMixin<rl_usuario_funcion, rl_usuario_funcionId>;
  addRl_usuario_funcions!: Sequelize.HasManyAddAssociationsMixin<rl_usuario_funcion, rl_usuario_funcionId>;
  createRl_usuario_funcion!: Sequelize.HasManyCreateAssociationMixin<rl_usuario_funcion>;
  removeRl_usuario_funcion!: Sequelize.HasManyRemoveAssociationMixin<rl_usuario_funcion, rl_usuario_funcionId>;
  removeRl_usuario_funcions!: Sequelize.HasManyRemoveAssociationsMixin<rl_usuario_funcion, rl_usuario_funcionId>;
  hasRl_usuario_funcion!: Sequelize.HasManyHasAssociationMixin<rl_usuario_funcion, rl_usuario_funcionId>;
  hasRl_usuario_funcions!: Sequelize.HasManyHasAssociationsMixin<rl_usuario_funcion, rl_usuario_funcionId>;
  countRl_usuario_funcions!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany rl_usuario_puesto via ct_usuario_id
  rl_usuario_puestos!: rl_usuario_puesto[];
  getRl_usuario_puestos!: Sequelize.HasManyGetAssociationsMixin<rl_usuario_puesto>;
  setRl_usuario_puestos!: Sequelize.HasManySetAssociationsMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  addRl_usuario_puesto!: Sequelize.HasManyAddAssociationMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  addRl_usuario_puestos!: Sequelize.HasManyAddAssociationsMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  createRl_usuario_puesto!: Sequelize.HasManyCreateAssociationMixin<rl_usuario_puesto>;
  removeRl_usuario_puesto!: Sequelize.HasManyRemoveAssociationMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  removeRl_usuario_puestos!: Sequelize.HasManyRemoveAssociationsMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  hasRl_usuario_puesto!: Sequelize.HasManyHasAssociationMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  hasRl_usuario_puestos!: Sequelize.HasManyHasAssociationsMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  countRl_usuario_puestos!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany rl_usuario_puesto via ct_usuario_in
  ct_usuario_in_rl_usuario_puestos!: rl_usuario_puesto[];
  getCt_usuario_in_rl_usuario_puestos!: Sequelize.HasManyGetAssociationsMixin<rl_usuario_puesto>;
  setCt_usuario_in_rl_usuario_puestos!: Sequelize.HasManySetAssociationsMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  addCt_usuario_in_rl_usuario_puesto!: Sequelize.HasManyAddAssociationMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  addCt_usuario_in_rl_usuario_puestos!: Sequelize.HasManyAddAssociationsMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  createCt_usuario_in_rl_usuario_puesto!: Sequelize.HasManyCreateAssociationMixin<rl_usuario_puesto>;
  removeCt_usuario_in_rl_usuario_puesto!: Sequelize.HasManyRemoveAssociationMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  removeCt_usuario_in_rl_usuario_puestos!: Sequelize.HasManyRemoveAssociationsMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  hasCt_usuario_in_rl_usuario_puesto!: Sequelize.HasManyHasAssociationMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  hasCt_usuario_in_rl_usuario_puestos!: Sequelize.HasManyHasAssociationsMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  countCt_usuario_in_rl_usuario_puestos!: Sequelize.HasManyCountAssociationsMixin;
  // ct_usuario hasMany rl_usuario_puesto via ct_usuario_at
  ct_usuario_at_rl_usuario_puestos!: rl_usuario_puesto[];
  getCt_usuario_at_rl_usuario_puestos!: Sequelize.HasManyGetAssociationsMixin<rl_usuario_puesto>;
  setCt_usuario_at_rl_usuario_puestos!: Sequelize.HasManySetAssociationsMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  addCt_usuario_at_rl_usuario_puesto!: Sequelize.HasManyAddAssociationMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  addCt_usuario_at_rl_usuario_puestos!: Sequelize.HasManyAddAssociationsMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  createCt_usuario_at_rl_usuario_puesto!: Sequelize.HasManyCreateAssociationMixin<rl_usuario_puesto>;
  removeCt_usuario_at_rl_usuario_puesto!: Sequelize.HasManyRemoveAssociationMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  removeCt_usuario_at_rl_usuario_puestos!: Sequelize.HasManyRemoveAssociationsMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  hasCt_usuario_at_rl_usuario_puesto!: Sequelize.HasManyHasAssociationMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  hasCt_usuario_at_rl_usuario_puestos!: Sequelize.HasManyHasAssociationsMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  countCt_usuario_at_rl_usuario_puestos!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof ct_usuario {
    return ct_usuario.init({
    id_usuario: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre_usuario: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "nombre_usuario_UNIQUE"
    },
    contrasena: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    telefono: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email_institucional: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    curp: {
      type: DataTypes.STRING(18),
      allowNull: false,
      unique: "curp_UNIQUE"
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    ct_usuario_in: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ct_usuario',
        key: 'id_usuario'
      }
    },
    ct_usuario_at: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'ct_usuario',
        key: 'id_usuario'
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'ct_usuario',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_usuario" },
        ]
      },
      {
        name: "curp_UNIQUE",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "curp" },
        ]
      },
      {
        name: "nombre_usuario_UNIQUE",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "nombre_usuario" },
        ]
      },
      {
        name: "fk_ct_usuario_creado_por",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_in" },
        ]
      },
      {
        name: "fk_ct_usuario_actualizado_por",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_at" },
        ]
      },
    ]
  });
  }
}
