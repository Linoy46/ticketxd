import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_consumible_direccion, ct_consumible_direccionId } from './ct_consumible_direccion';

export interface ct_consumible_departamentoAttributes {
  id_departamento: number;
  nombre_departamento: string;
  ct_puesto_id: number;
  ct_direccion_id: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ct_consumible_departamentoPk = "id_departamento";
export type ct_consumible_departamentoId = ct_consumible_departamento[ct_consumible_departamentoPk];
export type ct_consumible_departamentoOptionalAttributes = "id_departamento";
export type ct_consumible_departamentoCreationAttributes = Optional<ct_consumible_departamentoAttributes, ct_consumible_departamentoOptionalAttributes>;

export class ct_consumible_departamento extends Model<ct_consumible_departamentoAttributes, ct_consumible_departamentoCreationAttributes> implements ct_consumible_departamentoAttributes {
  id_departamento!: number;
  nombre_departamento!: string;
  ct_puesto_id!: number;
  ct_direccion_id!: number;
  createdAt!: Date;
  updatedAt!: Date;

  // ct_consumible_departamento belongsTo ct_consumible_direccion via ct_direccion_id
  ct_direccion!: ct_consumible_direccion;
  getCt_direccion!: Sequelize.BelongsToGetAssociationMixin<ct_consumible_direccion>;
  setCt_direccion!: Sequelize.BelongsToSetAssociationMixin<ct_consumible_direccion, ct_consumible_direccionId>;
  createCt_direccion!: Sequelize.BelongsToCreateAssociationMixin<ct_consumible_direccion>;

  static initModel(sequelize: Sequelize.Sequelize): typeof ct_consumible_departamento {
    return ct_consumible_departamento.init({
    id_departamento: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre_departamento: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    ct_puesto_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ct_direccion_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ct_consumible_direccion',
        key: 'id_direccion'
      }
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
    tableName: 'ct_consumible_departamento',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_departamento" },
        ]
      },
      {
        name: "ct_direccion_id",
        using: "BTREE",
        fields: [
          { name: "ct_direccion_id" },
        ]
      },
    ]
  });
  }
}
