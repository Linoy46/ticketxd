import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { dt_aspirante_aneec, dt_aspirante_aneecId } from './dt_aspirante_aneec';
import type { dt_diagnostico_aneec, dt_diagnostico_aneecId } from './dt_diagnostico_aneec';

export interface ct_municipioAttributes {
  id_municipio: number;
  municipio: string;
}

export type ct_municipioPk = "id_municipio";
export type ct_municipioId = ct_municipio[ct_municipioPk];
export type ct_municipioOptionalAttributes = "id_municipio" | "municipio";
export type ct_municipioCreationAttributes = Optional<ct_municipioAttributes, ct_municipioOptionalAttributes>;

export class ct_municipio extends Model<ct_municipioAttributes, ct_municipioCreationAttributes> implements ct_municipioAttributes {
  id_municipio!: number;
  municipio!: string;

  // ct_municipio hasMany dt_aspirante_aneec via ct_municipio_id
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
  // ct_municipio hasMany dt_diagnostico_aneec via ct_municipio_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof ct_municipio {
    return ct_municipio.init({
    id_municipio: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    municipio: {
      type: DataTypes.STRING(300),
      allowNull: false,
      defaultValue: "0"
    }
  }, {
    sequelize,
    tableName: 'ct_municipio',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_municipio" },
        ]
      },
    ]
  });
  }
}
