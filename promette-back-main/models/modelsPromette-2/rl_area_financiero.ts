import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_usuario, ct_usuarioId } from './ct_usuario';
import type { dt_techo_presupuesto, dt_techo_presupuestoId } from './dt_techo_presupuesto';
import type { rl_analista_unidad, rl_analista_unidadId } from './rl_analista_unidad';
import type { rl_justificacion, rl_justificacionId } from './rl_justificacion';
import type { rl_partida_area, rl_partida_areaId } from './rl_partida_area';
import type { rl_producto_area, rl_producto_areaId } from './rl_producto_area';
import type { rl_producto_requisicion, rl_producto_requisicionId } from './rl_producto_requisicion';

export interface rl_area_financieroAttributes {
  id_area_fin: number;
  id_financiero: number;
  id_area_infra: number;
  ct_usuario_in: number;
  ct_usuario_at?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export type rl_area_financieroPk = "id_area_fin";
export type rl_area_financieroId = rl_area_financiero[rl_area_financieroPk];
export type rl_area_financieroOptionalAttributes = "id_area_fin" | "id_financiero" | "id_area_infra" | "ct_usuario_in" | "ct_usuario_at" | "createdAt" | "updatedAt";
export type rl_area_financieroCreationAttributes = Optional<rl_area_financieroAttributes, rl_area_financieroOptionalAttributes>;

export class rl_area_financiero extends Model<rl_area_financieroAttributes, rl_area_financieroCreationAttributes> implements rl_area_financieroAttributes {
  id_area_fin!: number;
  id_financiero!: number;
  id_area_infra!: number;
  ct_usuario_in!: number;
  ct_usuario_at?: number;
  createdAt!: Date;
  updatedAt?: Date;

  // rl_area_financiero belongsTo ct_usuario via ct_usuario_in
  ct_usuario_in_ct_usuario!: ct_usuario;
  getCt_usuario_in_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_in_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_in_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // rl_area_financiero belongsTo ct_usuario via ct_usuario_at
  ct_usuario_at_ct_usuario!: ct_usuario;
  getCt_usuario_at_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_at_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_at_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // rl_area_financiero hasMany dt_techo_presupuesto via ct_area_id
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
  // rl_area_financiero hasMany rl_analista_unidad via rl_area_financiero
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
  // rl_area_financiero hasMany rl_justificacion via ct_area_id
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
  // rl_area_financiero hasMany rl_partida_area via id_area_infra
  rl_partida_areas!: rl_partida_area[];
  getRl_partida_areas!: Sequelize.HasManyGetAssociationsMixin<rl_partida_area>;
  setRl_partida_areas!: Sequelize.HasManySetAssociationsMixin<rl_partida_area, rl_partida_areaId>;
  addRl_partida_area!: Sequelize.HasManyAddAssociationMixin<rl_partida_area, rl_partida_areaId>;
  addRl_partida_areas!: Sequelize.HasManyAddAssociationsMixin<rl_partida_area, rl_partida_areaId>;
  createRl_partida_area!: Sequelize.HasManyCreateAssociationMixin<rl_partida_area>;
  removeRl_partida_area!: Sequelize.HasManyRemoveAssociationMixin<rl_partida_area, rl_partida_areaId>;
  removeRl_partida_areas!: Sequelize.HasManyRemoveAssociationsMixin<rl_partida_area, rl_partida_areaId>;
  hasRl_partida_area!: Sequelize.HasManyHasAssociationMixin<rl_partida_area, rl_partida_areaId>;
  hasRl_partida_areas!: Sequelize.HasManyHasAssociationsMixin<rl_partida_area, rl_partida_areaId>;
  countRl_partida_areas!: Sequelize.HasManyCountAssociationsMixin;
  // rl_area_financiero hasMany rl_producto_area via id_area_infra
  rl_producto_areas!: rl_producto_area[];
  getRl_producto_areas!: Sequelize.HasManyGetAssociationsMixin<rl_producto_area>;
  setRl_producto_areas!: Sequelize.HasManySetAssociationsMixin<rl_producto_area, rl_producto_areaId>;
  addRl_producto_area!: Sequelize.HasManyAddAssociationMixin<rl_producto_area, rl_producto_areaId>;
  addRl_producto_areas!: Sequelize.HasManyAddAssociationsMixin<rl_producto_area, rl_producto_areaId>;
  createRl_producto_area!: Sequelize.HasManyCreateAssociationMixin<rl_producto_area>;
  removeRl_producto_area!: Sequelize.HasManyRemoveAssociationMixin<rl_producto_area, rl_producto_areaId>;
  removeRl_producto_areas!: Sequelize.HasManyRemoveAssociationsMixin<rl_producto_area, rl_producto_areaId>;
  hasRl_producto_area!: Sequelize.HasManyHasAssociationMixin<rl_producto_area, rl_producto_areaId>;
  hasRl_producto_areas!: Sequelize.HasManyHasAssociationsMixin<rl_producto_area, rl_producto_areaId>;
  countRl_producto_areas!: Sequelize.HasManyCountAssociationsMixin;
  // rl_area_financiero hasMany rl_producto_requisicion via ct_area_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof rl_area_financiero {
    return rl_area_financiero.init({
    id_area_fin: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_financiero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    id_area_infra: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    ct_usuario_in: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      references: {
        model: 'ct_usuario',
        key: 'id_usuario'
      }
    },
    ct_usuario_at: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
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
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'rl_area_financiero',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_area_fin" },
        ]
      },
      {
        name: "fk_area_fin_usuario_in",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_in" },
        ]
      },
      {
        name: "fk_area_fin_usuario_at",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_at" },
        ]
      },
      {
        name: "idx_id_area_infra",
        using: "BTREE",
        fields: [
          { name: "id_area_infra" },
        ]
      },
    ]
  });
  }
}
