import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_documentos_aneec, ct_documentos_aneecId } from './ct_documentos_aneec';
import type { ct_usuario, ct_usuarioId } from './ct_usuario';
import type { dt_aspirante_aneec, dt_aspirante_aneecId } from './dt_aspirante_aneec';
import type { dt_diagnostico_aneec, dt_diagnostico_aneecId } from './dt_diagnostico_aneec';

export interface dt_planeaciones_aneecAttributes {
  id_planeacion: number;
  ruta_documento: string;
  id_tipo_documento: number;
  dt_aspirante_id: number;
  dt_diagnostico_id: number;
  ct_usuario_in: number;
  createdAt: Date;
  ct_usuario_at?: number;
  updatedAt?: Date;
}

export type dt_planeaciones_aneecPk = "id_planeacion";
export type dt_planeaciones_aneecId = dt_planeaciones_aneec[dt_planeaciones_aneecPk];
export type dt_planeaciones_aneecOptionalAttributes = "id_planeacion" | "createdAt" | "ct_usuario_at" | "updatedAt";
export type dt_planeaciones_aneecCreationAttributes = Optional<dt_planeaciones_aneecAttributes, dt_planeaciones_aneecOptionalAttributes>;

export class dt_planeaciones_aneec extends Model<dt_planeaciones_aneecAttributes, dt_planeaciones_aneecCreationAttributes> implements dt_planeaciones_aneecAttributes {
  id_planeacion!: number;
  ruta_documento!: string;
  id_tipo_documento!: number;
  dt_aspirante_id!: number;
  dt_diagnostico_id!: number;
  ct_usuario_in!: number;
  createdAt!: Date;
  ct_usuario_at?: number;
  updatedAt?: Date;

  // dt_planeaciones_aneec belongsTo ct_documentos_aneec via id_tipo_documento
  id_tipo_documento_ct_documentos_aneec!: ct_documentos_aneec;
  getId_tipo_documento_ct_documentos_aneec!: Sequelize.BelongsToGetAssociationMixin<ct_documentos_aneec>;
  setId_tipo_documento_ct_documentos_aneec!: Sequelize.BelongsToSetAssociationMixin<ct_documentos_aneec, ct_documentos_aneecId>;
  createId_tipo_documento_ct_documentos_aneec!: Sequelize.BelongsToCreateAssociationMixin<ct_documentos_aneec>;
  // dt_planeaciones_aneec belongsTo ct_usuario via ct_usuario_in
  ct_usuario_in_ct_usuario!: ct_usuario;
  getCt_usuario_in_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_in_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_in_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // dt_planeaciones_aneec belongsTo ct_usuario via ct_usuario_at
  ct_usuario_at_ct_usuario!: ct_usuario;
  getCt_usuario_at_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_at_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_at_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // dt_planeaciones_aneec belongsTo dt_aspirante_aneec via dt_aspirante_id
  dt_aspirante!: dt_aspirante_aneec;
  getDt_aspirante!: Sequelize.BelongsToGetAssociationMixin<dt_aspirante_aneec>;
  setDt_aspirante!: Sequelize.BelongsToSetAssociationMixin<dt_aspirante_aneec, dt_aspirante_aneecId>;
  createDt_aspirante!: Sequelize.BelongsToCreateAssociationMixin<dt_aspirante_aneec>;
  // dt_planeaciones_aneec belongsTo dt_diagnostico_aneec via dt_diagnostico_id
  dt_diagnostico!: dt_diagnostico_aneec;
  getDt_diagnostico!: Sequelize.BelongsToGetAssociationMixin<dt_diagnostico_aneec>;
  setDt_diagnostico!: Sequelize.BelongsToSetAssociationMixin<dt_diagnostico_aneec, dt_diagnostico_aneecId>;
  createDt_diagnostico!: Sequelize.BelongsToCreateAssociationMixin<dt_diagnostico_aneec>;

  static initModel(sequelize: Sequelize.Sequelize): typeof dt_planeaciones_aneec {
    return dt_planeaciones_aneec.init({
    id_planeacion: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ruta_documento: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    id_tipo_documento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ct_documentos_aneec',
        key: 'id_tipo_documento'
      }
    },
    dt_aspirante_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'dt_aspirante_aneec',
        key: 'id_aspirante'
      }
    },
    dt_diagnostico_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'dt_diagnostico_aneec',
        key: 'id_diagnostico'
      }
    },
    ct_usuario_in: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    ct_usuario_at: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'ct_usuario',
        key: 'id_usuario'
      }
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'dt_planeaciones_aneec',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_planeacion" },
        ]
      },
      {
        name: "FK_dt_planeaciones_aneec_ct_documentos_aneec",
        using: "BTREE",
        fields: [
          { name: "id_tipo_documento" },
        ]
      },
      {
        name: "FK_dt_planeaciones_aneec_dt_aspirante_aneec",
        using: "BTREE",
        fields: [
          { name: "dt_aspirante_id" },
        ]
      },
      {
        name: "FK_dt_planeaciones_aneec_dt_diagnostico_aneec",
        using: "BTREE",
        fields: [
          { name: "dt_diagnostico_id" },
        ]
      },
      {
        name: "FK_dt_planeaciones_aneec_ct_usuario_creado_por",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_in" },
        ]
      },
      {
        name: "FK_dt_planeaciones_aneec__actualizado_por",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_at" },
        ]
      },
    ]
  });
  }
}
