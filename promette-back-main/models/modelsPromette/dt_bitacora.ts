import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_accion, ct_accionId } from './ct_accion';
import type { ct_dispositivo, ct_dispositivoId } from './ct_dispositivo';
import type { ct_tabla, ct_tablaId } from './ct_tabla';
import type { ct_usuario, ct_usuarioId } from './ct_usuario';

export interface dt_bitacoraAttributes {
  id_bitacora: number;
  createdAt: Date;
  ct_usuario_id: number;
  ct_accion_id: number;
  registro_id: number;
  ct_tabla_id: number;
  ip_origen: string;
  ct_dispositivo_id?: number;
  estatus_accion: number;
  detalles_error?: string;
  updatedAt?: Date;
}

export type dt_bitacoraPk = "id_bitacora";
export type dt_bitacoraId = dt_bitacora[dt_bitacoraPk];
export type dt_bitacoraOptionalAttributes = "id_bitacora" | "createdAt" | "ip_origen" | "ct_dispositivo_id" | "detalles_error" | "updatedAt";
export type dt_bitacoraCreationAttributes = Optional<dt_bitacoraAttributes, dt_bitacoraOptionalAttributes>;

export class dt_bitacora extends Model<dt_bitacoraAttributes, dt_bitacoraCreationAttributes> implements dt_bitacoraAttributes {
  id_bitacora!: number;
  createdAt!: Date;
  ct_usuario_id!: number;
  ct_accion_id!: number;
  registro_id!: number;
  ct_tabla_id!: number;
  ip_origen!: string;
  ct_dispositivo_id?: number;
  estatus_accion!: number;
  detalles_error?: string;
  updatedAt?: Date;

  // dt_bitacora belongsTo ct_accion via ct_accion_id
  ct_accion!: ct_accion;
  getCt_accion!: Sequelize.BelongsToGetAssociationMixin<ct_accion>;
  setCt_accion!: Sequelize.BelongsToSetAssociationMixin<ct_accion, ct_accionId>;
  createCt_accion!: Sequelize.BelongsToCreateAssociationMixin<ct_accion>;
  // dt_bitacora belongsTo ct_dispositivo via ct_dispositivo_id
  ct_dispositivo!: ct_dispositivo;
  getCt_dispositivo!: Sequelize.BelongsToGetAssociationMixin<ct_dispositivo>;
  setCt_dispositivo!: Sequelize.BelongsToSetAssociationMixin<ct_dispositivo, ct_dispositivoId>;
  createCt_dispositivo!: Sequelize.BelongsToCreateAssociationMixin<ct_dispositivo>;
  // dt_bitacora belongsTo ct_tabla via ct_tabla_id
  ct_tabla!: ct_tabla;
  getCt_tabla!: Sequelize.BelongsToGetAssociationMixin<ct_tabla>;
  setCt_tabla!: Sequelize.BelongsToSetAssociationMixin<ct_tabla, ct_tablaId>;
  createCt_tabla!: Sequelize.BelongsToCreateAssociationMixin<ct_tabla>;
  // dt_bitacora belongsTo ct_usuario via ct_usuario_id
  ct_usuario!: ct_usuario;
  getCt_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;

  static initModel(sequelize: Sequelize.Sequelize): typeof dt_bitacora {
    return dt_bitacora.init({
    id_bitacora: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    ct_usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ct_usuario',
        key: 'id_usuario'
      }
    },
    ct_accion_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ct_accion',
        key: 'id_accion'
      }
    },
    registro_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ct_tabla_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ct_tabla',
        key: 'id_tabla'
      }
    },
    ip_origen: {
      type: DataTypes.STRING(45),
      allowNull: false,
      defaultValue: "0.0.0.0"
    },
    ct_dispositivo_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'ct_dispositivo',
        key: 'id_dispositivo'
      }
    },
    estatus_accion: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    detalles_error: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'dt_bitacora',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_bitacora" },
        ]
      },
      {
        name: "fk_usuario_bitacora",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_id" },
        ]
      },
      {
        name: "fk_accion_bitacora",
        using: "BTREE",
        fields: [
          { name: "ct_accion_id" },
        ]
      },
      {
        name: "fk_tabla_bitacora",
        using: "BTREE",
        fields: [
          { name: "ct_tabla_id" },
        ]
      },
      {
        name: "fk_dispositivo_bitacora",
        using: "BTREE",
        fields: [
          { name: "ct_dispositivo_id" },
        ]
      },
    ]
  });
  }
}
