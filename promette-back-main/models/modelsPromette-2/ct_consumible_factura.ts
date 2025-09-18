import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_consumibles_proveedor, ct_consumibles_proveedorId } from './ct_consumibles_proveedor';
import type { dt_consumible_inventario, dt_consumible_inventarioId } from './dt_consumible_inventario';

export interface ct_consumible_facturaAttributes {
  id_factura: number;
  factura: string;
  ct_provedor_id: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ct_consumible_facturaPk = "id_factura";
export type ct_consumible_facturaId = ct_consumible_factura[ct_consumible_facturaPk];
export type ct_consumible_facturaOptionalAttributes = "id_factura" | "createdAt" | "updatedAt";
export type ct_consumible_facturaCreationAttributes = Optional<ct_consumible_facturaAttributes, ct_consumible_facturaOptionalAttributes>;

export class ct_consumible_factura extends Model<ct_consumible_facturaAttributes, ct_consumible_facturaCreationAttributes> implements ct_consumible_facturaAttributes {
  id_factura!: number;
  factura!: string;
  ct_provedor_id!: number;
  createdAt!: Date;
  updatedAt!: Date;

  // ct_consumible_factura hasMany dt_consumible_inventario via ct_factura_id
  dt_consumible_inventarios!: dt_consumible_inventario[];
  getDt_consumible_inventarios!: Sequelize.HasManyGetAssociationsMixin<dt_consumible_inventario>;
  setDt_consumible_inventarios!: Sequelize.HasManySetAssociationsMixin<dt_consumible_inventario, dt_consumible_inventarioId>;
  addDt_consumible_inventario!: Sequelize.HasManyAddAssociationMixin<dt_consumible_inventario, dt_consumible_inventarioId>;
  addDt_consumible_inventarios!: Sequelize.HasManyAddAssociationsMixin<dt_consumible_inventario, dt_consumible_inventarioId>;
  createDt_consumible_inventario!: Sequelize.HasManyCreateAssociationMixin<dt_consumible_inventario>;
  removeDt_consumible_inventario!: Sequelize.HasManyRemoveAssociationMixin<dt_consumible_inventario, dt_consumible_inventarioId>;
  removeDt_consumible_inventarios!: Sequelize.HasManyRemoveAssociationsMixin<dt_consumible_inventario, dt_consumible_inventarioId>;
  hasDt_consumible_inventario!: Sequelize.HasManyHasAssociationMixin<dt_consumible_inventario, dt_consumible_inventarioId>;
  hasDt_consumible_inventarios!: Sequelize.HasManyHasAssociationsMixin<dt_consumible_inventario, dt_consumible_inventarioId>;
  countDt_consumible_inventarios!: Sequelize.HasManyCountAssociationsMixin;
  // ct_consumible_factura belongsTo ct_consumibles_proveedor via ct_provedor_id
  ct_provedor!: ct_consumibles_proveedor;
  getCt_provedor!: Sequelize.BelongsToGetAssociationMixin<ct_consumibles_proveedor>;
  setCt_provedor!: Sequelize.BelongsToSetAssociationMixin<ct_consumibles_proveedor, ct_consumibles_proveedorId>;
  createCt_provedor!: Sequelize.BelongsToCreateAssociationMixin<ct_consumibles_proveedor>;

  static initModel(sequelize: Sequelize.Sequelize): typeof ct_consumible_factura {
    return ct_consumible_factura.init({
    id_factura: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    factura: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    ct_provedor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ct_consumibles_proveedor',
        key: 'id_proveedor'
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
    tableName: 'ct_consumible_factura',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_factura" },
        ]
      },
      {
        name: "FK_ct_facturas_ct_proveedor",
        using: "BTREE",
        fields: [
          { name: "ct_provedor_id" },
        ]
      },
    ]
  });
  }
}
