import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { dt_bitacora, dt_bitacoraId } from './dt_bitacora';

export interface ct_dispositivoAttributes {
  id_dispositivo: number;
  nombre_dispositivo: string;
  descripcion?: string;
}

export type ct_dispositivoPk = "id_dispositivo";
export type ct_dispositivoId = ct_dispositivo[ct_dispositivoPk];
export type ct_dispositivoOptionalAttributes = "id_dispositivo" | "descripcion";
export type ct_dispositivoCreationAttributes = Optional<ct_dispositivoAttributes, ct_dispositivoOptionalAttributes>;

export class ct_dispositivo extends Model<ct_dispositivoAttributes, ct_dispositivoCreationAttributes> implements ct_dispositivoAttributes {
  id_dispositivo!: number;
  nombre_dispositivo!: string;
  descripcion?: string;

  // ct_dispositivo hasMany dt_bitacora via ct_dispositivo_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof ct_dispositivo {
    return ct_dispositivo.init({
    id_dispositivo: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre_dispositivo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "nombre_dispositivo_UNIQUE"
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ct_dispositivo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_dispositivo" },
        ]
      },
      {
        name: "nombre_dispositivo_UNIQUE",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "nombre_dispositivo" },
        ]
      },
    ]
  });
  }
}
