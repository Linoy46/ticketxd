import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { dt_bitacora, dt_bitacoraId } from './dt_bitacora';

export interface ct_accionAttributes {
  id_accion: number;
  nombre_accion: string;
  descripcion?: string;
}

export type ct_accionPk = "id_accion";
export type ct_accionId = ct_accion[ct_accionPk];
export type ct_accionOptionalAttributes = "id_accion" | "descripcion";
export type ct_accionCreationAttributes = Optional<ct_accionAttributes, ct_accionOptionalAttributes>;

export class ct_accion extends Model<ct_accionAttributes, ct_accionCreationAttributes> implements ct_accionAttributes {
  id_accion!: number;
  nombre_accion!: string;
  descripcion?: string;

  // ct_accion hasMany dt_bitacora via ct_accion_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof ct_accion {
    return ct_accion.init({
    id_accion: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre_accion: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "nombre_accion_UNIQUE"
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ct_accion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_accion" },
        ]
      },
      {
        name: "nombre_accion_UNIQUE",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "nombre_accion" },
        ]
      },
    ]
  });
  }
}
