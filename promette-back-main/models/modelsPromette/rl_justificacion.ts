import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_partida, ct_partidaId } from './ct_partida';
import type { ct_usuario, ct_usuarioId } from './ct_usuario';
import type { dt_techo_presupuesto, dt_techo_presupuestoId } from './dt_techo_presupuesto';
import type { rl_area_financiero, rl_area_financieroId } from './rl_area_financiero';

export interface rl_justificacionAttributes {
  id_justificacion: number;
  ct_partida_id: number;
  ct_area_id: number;
  dt_techo_id?: number;
  justificacion: string;
  ct_usuario_id?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type rl_justificacionPk = "id_justificacion";
export type rl_justificacionId = rl_justificacion[rl_justificacionPk];
export type rl_justificacionOptionalAttributes = "id_justificacion" | "dt_techo_id" | "ct_usuario_id" | "createdAt" | "updatedAt";
export type rl_justificacionCreationAttributes = Optional<rl_justificacionAttributes, rl_justificacionOptionalAttributes>;

export class rl_justificacion extends Model<rl_justificacionAttributes, rl_justificacionCreationAttributes> implements rl_justificacionAttributes {
  id_justificacion!: number;
  ct_partida_id!: number;
  ct_area_id!: number;
  dt_techo_id?: number;
  justificacion!: string;
  ct_usuario_id?: number;
  createdAt!: Date;
  updatedAt!: Date;

  // rl_justificacion belongsTo ct_partida via ct_partida_id
  ct_partida!: ct_partida;
  getCt_partida!: Sequelize.BelongsToGetAssociationMixin<ct_partida>;
  setCt_partida!: Sequelize.BelongsToSetAssociationMixin<ct_partida, ct_partidaId>;
  createCt_partida!: Sequelize.BelongsToCreateAssociationMixin<ct_partida>;
  // rl_justificacion belongsTo ct_usuario via ct_usuario_id
  ct_usuario!: ct_usuario;
  getCt_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // rl_justificacion belongsTo dt_techo_presupuesto via dt_techo_id
  dt_techo!: dt_techo_presupuesto;
  getDt_techo!: Sequelize.BelongsToGetAssociationMixin<dt_techo_presupuesto>;
  setDt_techo!: Sequelize.BelongsToSetAssociationMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  createDt_techo!: Sequelize.BelongsToCreateAssociationMixin<dt_techo_presupuesto>;
  // rl_justificacion belongsTo rl_area_financiero via ct_area_id
  ct_area!: rl_area_financiero;
  getCt_area!: Sequelize.BelongsToGetAssociationMixin<rl_area_financiero>;
  setCt_area!: Sequelize.BelongsToSetAssociationMixin<rl_area_financiero, rl_area_financieroId>;
  createCt_area!: Sequelize.BelongsToCreateAssociationMixin<rl_area_financiero>;

  static initModel(sequelize: Sequelize.Sequelize): typeof rl_justificacion {
    return rl_justificacion.init({
    id_justificacion: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ct_partida_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "ID de la partida relacionada con esta justificación",
      references: {
        model: 'ct_partida',
        key: 'id_partida'
      }
    },
    ct_area_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "ID del área relacionada con esta justificación",
      references: {
        model: 'rl_area_financiero',
        key: 'id_area_fin'
      }
    },
    dt_techo_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      references: {
        model: 'dt_techo_presupuesto',
        key: 'id_techo'
      }
    },
    justificacion: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Texto de la justificación para la combinación área-partida"
    },
    ct_usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Usuario que creó la justificación",
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
    tableName: 'rl_justificacion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_justificacion" },
        ]
      },
      {
        name: "idx_justificacion_partida",
        using: "BTREE",
        fields: [
          { name: "ct_partida_id" },
        ]
      },
      {
        name: "idx_justificacion_area",
        using: "BTREE",
        fields: [
          { name: "ct_area_id" },
        ]
      },
      {
        name: "idx_justificacion_usuario",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_id" },
        ]
      },
      {
        name: "idx_justificacion_partida_area",
        using: "BTREE",
        fields: [
          { name: "ct_partida_id" },
          { name: "ct_area_id" },
        ]
      },
      {
        name: "FK_rl_justificacion_dt_techo_presupuesto",
        using: "BTREE",
        fields: [
          { name: "dt_techo_id" },
        ]
      },
      {
        name: "idx_justificacion_area_financiera",
        using: "BTREE",
        fields: [
          { name: "ct_area_id" },
        ]
      },
      {
        name: "idx_justificacion_partida_area_financiera",
        using: "BTREE",
        fields: [
          { name: "ct_partida_id" },
          { name: "ct_area_id" },
        ]
      },
      {
        name: "FK_rl_justificacion_rl_area_financiero",
        using: "BTREE",
        fields: [
          { name: "ct_area_id" },
        ]
      },
    ]
  });
  }
}
