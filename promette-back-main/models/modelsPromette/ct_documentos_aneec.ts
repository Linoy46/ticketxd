import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { dt_planeaciones_aneec, dt_planeaciones_aneecId } from './dt_planeaciones_aneec';

export interface ct_documentos_aneecAttributes {
  id_tipo_documento: number;
  nombre?: string;
  vigencia?: 'S' | 'N';
}

export type ct_documentos_aneecPk = "id_tipo_documento";
export type ct_documentos_aneecId = ct_documentos_aneec[ct_documentos_aneecPk];
export type ct_documentos_aneecOptionalAttributes = "id_tipo_documento" | "nombre" | "vigencia";
export type ct_documentos_aneecCreationAttributes = Optional<ct_documentos_aneecAttributes, ct_documentos_aneecOptionalAttributes>;

export class ct_documentos_aneec extends Model<ct_documentos_aneecAttributes, ct_documentos_aneecCreationAttributes> implements ct_documentos_aneecAttributes {
  id_tipo_documento!: number;
  nombre?: string;
  vigencia?: 'S' | 'N';

  // ct_documentos_aneec hasMany dt_planeaciones_aneec via id_tipo_documento
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

  static initModel(sequelize: Sequelize.Sequelize): typeof ct_documentos_aneec {
    return ct_documentos_aneec.init({
    id_tipo_documento: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    vigencia: {
      type: DataTypes.ENUM('S','N'),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ct_documentos_aneec',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_tipo_documento" },
        ]
      },
    ]
  });
  }
}
