import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_consumible_departamento, ct_consumible_departamentoId } from './ct_consumible_departamento';

export interface ct_consumible_direccionAttributes {
  id_direccion: number;
  nombre_direccion: string;
  ct_puesto_id: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ct_consumible_direccionPk = "id_direccion";
export type ct_consumible_direccionId = ct_consumible_direccion[ct_consumible_direccionPk];
export type ct_consumible_direccionOptionalAttributes = "id_direccion";
export type ct_consumible_direccionCreationAttributes = Optional<ct_consumible_direccionAttributes, ct_consumible_direccionOptionalAttributes>;

export class ct_consumible_direccion extends Model<ct_consumible_direccionAttributes, ct_consumible_direccionCreationAttributes> implements ct_consumible_direccionAttributes {
  id_direccion!: number;
  nombre_direccion!: string;
  ct_puesto_id!: number;
  createdAt!: Date;
  updatedAt!: Date;

  // ct_consumible_direccion hasMany ct_consumible_departamento via ct_direccion_id
  ct_consumible_departamentos!: ct_consumible_departamento[];
  getCt_consumible_departamentos!: Sequelize.HasManyGetAssociationsMixin<ct_consumible_departamento>;
  setCt_consumible_departamentos!: Sequelize.HasManySetAssociationsMixin<ct_consumible_departamento, ct_consumible_departamentoId>;
  addCt_consumible_departamento!: Sequelize.HasManyAddAssociationMixin<ct_consumible_departamento, ct_consumible_departamentoId>;
  addCt_consumible_departamentos!: Sequelize.HasManyAddAssociationsMixin<ct_consumible_departamento, ct_consumible_departamentoId>;
  createCt_consumible_departamento!: Sequelize.HasManyCreateAssociationMixin<ct_consumible_departamento>;
  removeCt_consumible_departamento!: Sequelize.HasManyRemoveAssociationMixin<ct_consumible_departamento, ct_consumible_departamentoId>;
  removeCt_consumible_departamentos!: Sequelize.HasManyRemoveAssociationsMixin<ct_consumible_departamento, ct_consumible_departamentoId>;
  hasCt_consumible_departamento!: Sequelize.HasManyHasAssociationMixin<ct_consumible_departamento, ct_consumible_departamentoId>;
  hasCt_consumible_departamentos!: Sequelize.HasManyHasAssociationsMixin<ct_consumible_departamento, ct_consumible_departamentoId>;
  countCt_consumible_departamentos!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof ct_consumible_direccion {
    return ct_consumible_direccion.init({
    id_direccion: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre_direccion: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    ct_puesto_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'ct_consumible_direccion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_direccion" },
        ]
      },
    ]
  });
  }
}
