import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_consumible_factura, ct_consumible_facturaId } from './ct_consumible_factura';

export interface ct_consumibles_proveedorAttributes {
  id_proveedor: number;
  razon_social: string;
  estado: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ct_consumibles_proveedorPk = "id_proveedor";
export type ct_consumibles_proveedorId = ct_consumibles_proveedor[ct_consumibles_proveedorPk];
export type ct_consumibles_proveedorOptionalAttributes = "id_proveedor" | "estado" | "createdAt" | "updatedAt";
export type ct_consumibles_proveedorCreationAttributes = Optional<ct_consumibles_proveedorAttributes, ct_consumibles_proveedorOptionalAttributes>;

export class ct_consumibles_proveedor extends Model<ct_consumibles_proveedorAttributes, ct_consumibles_proveedorCreationAttributes> implements ct_consumibles_proveedorAttributes {
  id_proveedor!: number;
  razon_social!: string;
  estado!: number;
  createdAt!: Date;
  updatedAt!: Date;

  // ct_consumibles_proveedor hasMany ct_consumible_factura via ct_provedor_id
  ct_consumible_facturas!: ct_consumible_factura[];
  getCt_consumible_facturas!: Sequelize.HasManyGetAssociationsMixin<ct_consumible_factura>;
  setCt_consumible_facturas!: Sequelize.HasManySetAssociationsMixin<ct_consumible_factura, ct_consumible_facturaId>;
  addCt_consumible_factura!: Sequelize.HasManyAddAssociationMixin<ct_consumible_factura, ct_consumible_facturaId>;
  addCt_consumible_facturas!: Sequelize.HasManyAddAssociationsMixin<ct_consumible_factura, ct_consumible_facturaId>;
  createCt_consumible_factura!: Sequelize.HasManyCreateAssociationMixin<ct_consumible_factura>;
  removeCt_consumible_factura!: Sequelize.HasManyRemoveAssociationMixin<ct_consumible_factura, ct_consumible_facturaId>;
  removeCt_consumible_facturas!: Sequelize.HasManyRemoveAssociationsMixin<ct_consumible_factura, ct_consumible_facturaId>;
  hasCt_consumible_factura!: Sequelize.HasManyHasAssociationMixin<ct_consumible_factura, ct_consumible_facturaId>;
  hasCt_consumible_facturas!: Sequelize.HasManyHasAssociationsMixin<ct_consumible_factura, ct_consumible_facturaId>;
  countCt_consumible_facturas!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof ct_consumibles_proveedor {
    return ct_consumibles_proveedor.init({
    id_proveedor: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    razon_social: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "uk_razon_social"
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
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
    tableName: 'ct_consumibles_proveedor',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_proveedor" },
        ]
      },
      {
        name: "uk_razon_social",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "razon_social", length: 191 },
        ]
      },
    ]
  });
  }
}
