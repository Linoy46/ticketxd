import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_municipio, ct_municipioId } from './ct_municipio';
import type { ct_usuario, ct_usuarioId } from './ct_usuario';
import type { dt_aspirante_aneec, dt_aspirante_aneecId } from './dt_aspirante_aneec';
import type { dt_informes_aneec, dt_informes_aneecId } from './dt_informes_aneec';
import type { dt_planeaciones_aneec, dt_planeaciones_aneecId } from './dt_planeaciones_aneec';

export interface dt_diagnostico_aneecAttributes {
  id_diagnostico: number;
  curp: string;
  nombreCompleto: string;
  ct_municipio_id: number;
  tipo_necesidad: string;
  rehabilitacion_fisica: 'S' | 'N';
  ruta_diagnostico: string;
  dt_aspirante_id: number;
  ct_usuario_in: number;
  createdAt: Date;
  ct_usuario_at?: number;
  updatedAt?: Date;
  ruta_INE_tutor: string;
  ruta_acta_nacimiento_usuario: string;
  ruta_comprobante_domicilio: string;
  ruta_privacidad_usuario: string;
  ruta_carta_compromiso_usuario: string;
}

export type dt_diagnostico_aneecPk = "id_diagnostico";
export type dt_diagnostico_aneecId = dt_diagnostico_aneec[dt_diagnostico_aneecPk];
export type dt_diagnostico_aneecOptionalAttributes = "id_diagnostico" | "createdAt" | "ct_usuario_at" | "updatedAt";
export type dt_diagnostico_aneecCreationAttributes = Optional<dt_diagnostico_aneecAttributes, dt_diagnostico_aneecOptionalAttributes>;

export class dt_diagnostico_aneec extends Model<dt_diagnostico_aneecAttributes, dt_diagnostico_aneecCreationAttributes> implements dt_diagnostico_aneecAttributes {
  id_diagnostico!: number;
  curp!: string;
  nombreCompleto!: string;
  ct_municipio_id!: number;
  tipo_necesidad!: string;
  rehabilitacion_fisica!: 'S' | 'N';
  ruta_diagnostico!: string;
  dt_aspirante_id!: number;
  ct_usuario_in!: number;
  createdAt!: Date;
  ct_usuario_at?: number;
  updatedAt?: Date;
  ruta_INE_tutor!: string;
  ruta_acta_nacimiento_usuario!: string;
  ruta_comprobante_domicilio!: string;
  ruta_privacidad_usuario!: string;
  ruta_carta_compromiso_usuario!: string;

  // dt_diagnostico_aneec belongsTo ct_municipio via ct_municipio_id
  ct_municipio!: ct_municipio;
  getCt_municipio!: Sequelize.BelongsToGetAssociationMixin<ct_municipio>;
  setCt_municipio!: Sequelize.BelongsToSetAssociationMixin<ct_municipio, ct_municipioId>;
  createCt_municipio!: Sequelize.BelongsToCreateAssociationMixin<ct_municipio>;
  // dt_diagnostico_aneec belongsTo ct_usuario via ct_usuario_in
  ct_usuario_in_ct_usuario!: ct_usuario;
  getCt_usuario_in_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_in_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_in_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // dt_diagnostico_aneec belongsTo ct_usuario via ct_usuario_at
  ct_usuario_at_ct_usuario!: ct_usuario;
  getCt_usuario_at_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_at_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_at_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // dt_diagnostico_aneec belongsTo dt_aspirante_aneec via dt_aspirante_id
  dt_aspirante!: dt_aspirante_aneec;
  getDt_aspirante!: Sequelize.BelongsToGetAssociationMixin<dt_aspirante_aneec>;
  setDt_aspirante!: Sequelize.BelongsToSetAssociationMixin<dt_aspirante_aneec, dt_aspirante_aneecId>;
  createDt_aspirante!: Sequelize.BelongsToCreateAssociationMixin<dt_aspirante_aneec>;
  // dt_diagnostico_aneec hasMany dt_informes_aneec via dt_diagnostico_id
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
  // dt_diagnostico_aneec hasMany dt_planeaciones_aneec via dt_diagnostico_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof dt_diagnostico_aneec {
    return dt_diagnostico_aneec.init({
    id_diagnostico: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    curp: {
      type: DataTypes.STRING(18),
      allowNull: false
    },
    nombreCompleto: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    ct_municipio_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ct_municipio',
        key: 'id_municipio'
      }
    },
    tipo_necesidad: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    rehabilitacion_fisica: {
      type: DataTypes.ENUM('S','N'),
      allowNull: false
    },
    ruta_diagnostico: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    dt_aspirante_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'dt_aspirante_aneec',
        key: 'id_aspirante'
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
    },
    ruta_INE_tutor: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    ruta_acta_nacimiento_usuario: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    ruta_comprobante_domicilio: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    ruta_privacidad_usuario: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    ruta_carta_compromiso_usuario: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'dt_diagnostico_aneec',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_diagnostico" },
        ]
      },
      {
        name: "fk_ct_municipio_id_diagnostico",
        using: "BTREE",
        fields: [
          { name: "ct_municipio_id" },
        ]
      },
      {
        name: "fk_dt_aspirante_id",
        using: "BTREE",
        fields: [
          { name: "dt_aspirante_id" },
        ]
      },
      {
        name: "fk_dt_diagnostico_aneec_creado_por",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_in" },
        ]
      },
      {
        name: "fk_dt_diagnostico_aneec_actualizado_por",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_at" },
        ]
      },
    ]
  });
  }
}
