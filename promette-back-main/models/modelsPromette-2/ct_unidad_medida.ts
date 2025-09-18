import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_producto_consumible, ct_producto_consumibleId } from './ct_producto_consumible';
import type { dt_consumible_entrega, dt_consumible_entregaId } from './dt_consumible_entrega';
import type { dt_consumible_inventario, dt_consumible_inventarioId } from './dt_consumible_inventario';

export interface ct_unidad_medidaAttributes {
  id_unidad: number;
  clave_unidad?: string;
  nombre_unidad?: string;
}

export type ct_unidad_medidaPk = "id_unidad";
export type ct_unidad_medidaId = ct_unidad_medida[ct_unidad_medidaPk];
export type ct_unidad_medidaOptionalAttributes = "id_unidad" | "clave_unidad" | "nombre_unidad";
export type ct_unidad_medidaCreationAttributes = Optional<ct_unidad_medidaAttributes, ct_unidad_medidaOptionalAttributes>;

export class ct_unidad_medida extends Model<ct_unidad_medidaAttributes, ct_unidad_medidaCreationAttributes> implements ct_unidad_medidaAttributes {
  id_unidad!: number;
  clave_unidad?: string;
  nombre_unidad?: string;

  // ct_unidad_medida hasMany ct_producto_consumible via ct_unidad_id
  ct_producto_consumibles!: ct_producto_consumible[];
  getCt_producto_consumibles!: Sequelize.HasManyGetAssociationsMixin<ct_producto_consumible>;
  setCt_producto_consumibles!: Sequelize.HasManySetAssociationsMixin<ct_producto_consumible, ct_producto_consumibleId>;
  addCt_producto_consumible!: Sequelize.HasManyAddAssociationMixin<ct_producto_consumible, ct_producto_consumibleId>;
  addCt_producto_consumibles!: Sequelize.HasManyAddAssociationsMixin<ct_producto_consumible, ct_producto_consumibleId>;
  createCt_producto_consumible!: Sequelize.HasManyCreateAssociationMixin<ct_producto_consumible>;
  removeCt_producto_consumible!: Sequelize.HasManyRemoveAssociationMixin<ct_producto_consumible, ct_producto_consumibleId>;
  removeCt_producto_consumibles!: Sequelize.HasManyRemoveAssociationsMixin<ct_producto_consumible, ct_producto_consumibleId>;
  hasCt_producto_consumible!: Sequelize.HasManyHasAssociationMixin<ct_producto_consumible, ct_producto_consumibleId>;
  hasCt_producto_consumibles!: Sequelize.HasManyHasAssociationsMixin<ct_producto_consumible, ct_producto_consumibleId>;
  countCt_producto_consumibles!: Sequelize.HasManyCountAssociationsMixin;
  // ct_unidad_medida hasMany dt_consumible_entrega via ct_unidad_id
  dt_consumible_entregas!: dt_consumible_entrega[];
  getDt_consumible_entregas!: Sequelize.HasManyGetAssociationsMixin<dt_consumible_entrega>;
  setDt_consumible_entregas!: Sequelize.HasManySetAssociationsMixin<dt_consumible_entrega, dt_consumible_entregaId>;
  addDt_consumible_entrega!: Sequelize.HasManyAddAssociationMixin<dt_consumible_entrega, dt_consumible_entregaId>;
  addDt_consumible_entregas!: Sequelize.HasManyAddAssociationsMixin<dt_consumible_entrega, dt_consumible_entregaId>;
  createDt_consumible_entrega!: Sequelize.HasManyCreateAssociationMixin<dt_consumible_entrega>;
  removeDt_consumible_entrega!: Sequelize.HasManyRemoveAssociationMixin<dt_consumible_entrega, dt_consumible_entregaId>;
  removeDt_consumible_entregas!: Sequelize.HasManyRemoveAssociationsMixin<dt_consumible_entrega, dt_consumible_entregaId>;
  hasDt_consumible_entrega!: Sequelize.HasManyHasAssociationMixin<dt_consumible_entrega, dt_consumible_entregaId>;
  hasDt_consumible_entregas!: Sequelize.HasManyHasAssociationsMixin<dt_consumible_entrega, dt_consumible_entregaId>;
  countDt_consumible_entregas!: Sequelize.HasManyCountAssociationsMixin;
  // ct_unidad_medida hasMany dt_consumible_inventario via ct_unidad_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof ct_unidad_medida {
    return ct_unidad_medida.init({
    id_unidad: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    clave_unidad: {
      type: DataTypes.STRING(4),
      allowNull: true
    },
    nombre_unidad: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ct_unidad_medida',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_unidad" },
        ]
      },
    ]
  });
  }
}
