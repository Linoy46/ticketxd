import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { dt_bitacora, dt_bitacoraId } from './dt_bitacora';

export interface ct_tablaAttributes {
  id_tabla: number;
  nombre_tabla: string;
  descripcion?: string;
}

export type ct_tablaPk = "id_tabla";
export type ct_tablaId = ct_tabla[ct_tablaPk];
export type ct_tablaOptionalAttributes = "id_tabla" | "descripcion";
export type ct_tablaCreationAttributes = Optional<ct_tablaAttributes, ct_tablaOptionalAttributes>;

export class ct_tabla extends Model<ct_tablaAttributes, ct_tablaCreationAttributes> implements ct_tablaAttributes {
  id_tabla!: number;
  nombre_tabla!: string;
  descripcion?: string;

  // ct_tabla hasMany dt_bitacora via ct_tabla_id
  dt_bitacoras!: dt_bitacora[];
  getDt_bitacoras!: Sequelize.HasManyGetAssociationsMixin<dt_bitacora>;
  setDt_bitacoras!: Sequelize.HasManySetAssociationsMixin<dt_bitacora, dt_bitacoraId>;
  addDt_bitacora!: Sequelize.HasManyAddAssociationMixin<dt_bitacora, dt_bitacoraId>;
  addDt_bitacoras!: Sequelize.HasManyAddAssociationsMixin<dt_bitacora, dt_bitacoraId>;
  createDt_bitacora!: Sequelize.HasManyCreateAssociationMixin<dt_bitacora>;
  removeDt_bitacora!: Sequelize.HasManyRemoveAssociationMixin<dt_bitacora, dt_bitacoraId>;
  removeDt_bitacoras!: Sequelize.HasManyRemoveAssociationsMixin<dt_bitacora, dt_bitacoraId>;
  hasDt_bitacora!: Sequelize.HasManyHasAssociationMixin<dt_bitacora, dt_bitacoraId>;
  hasDt_bitacoras!: Sequelize.HasManyHasAssociationsMixin<dt_bitacora, dt_bitacoraId>;
  countDt_bitacoras!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof ct_tabla {
    return ct_tabla.init({
    id_tabla: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre_tabla: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "nombre_tabla_UNIQUE"
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ct_tabla',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_tabla" },
        ]
      },
      {
        name: "nombre_tabla",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "nombre_tabla" },
        ]
      },
      {
        name: "nombre_tabla_UNIQUE",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "nombre_tabla" },
        ]
      },
    ]
  });
  }
}
