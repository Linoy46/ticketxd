import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { dt_dictamen_escalafon, dt_dictamen_escalafonId } from './dt_dictamen_escalafon';

export interface ct_grado_academicoAttributes {
  id_grado_academico: number;
  grado_academico?: string;
  unidad?: number;
  subunidad?: string;
  estado: number;
}

export type ct_grado_academicoPk = "id_grado_academico";
export type ct_grado_academicoId = ct_grado_academico[ct_grado_academicoPk];
export type ct_grado_academicoOptionalAttributes = "id_grado_academico" | "grado_academico" | "unidad" | "subunidad" | "estado";
export type ct_grado_academicoCreationAttributes = Optional<ct_grado_academicoAttributes, ct_grado_academicoOptionalAttributes>;

export class ct_grado_academico extends Model<ct_grado_academicoAttributes, ct_grado_academicoCreationAttributes> implements ct_grado_academicoAttributes {
  id_grado_academico!: number;
  grado_academico?: string;
  unidad?: number;
  subunidad?: string;
  estado!: number;

  // ct_grado_academico hasMany dt_dictamen_escalafon via ct_grado_academico_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof ct_grado_academico {
    return ct_grado_academico.init({
    id_grado_academico: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    grado_academico: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    unidad: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    subunidad: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'ct_grado_academico',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_grado_academico" },
        ]
      },
    ]
  });
  }
}
