import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_usuario, ct_usuarioId } from './ct_usuario';
import type { dt_funcion, dt_funcionId } from './dt_funcion';
import type { rl_modulo_area, rl_modulo_areaId } from './rl_modulo_area';

export interface ct_moduloAttributes {
  id_modulo: number;
  nombre_modulo: string;
  modulo_padre?: number;
  clave?: string;
  icono?: string;
  estado: number;
  ct_usuario_in: number;
  ct_usuario_at?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ct_moduloPk = "id_modulo";
export type ct_moduloId = ct_modulo[ct_moduloPk];
export type ct_moduloOptionalAttributes = "id_modulo" | "modulo_padre" | "clave" | "icono" | "estado" | "ct_usuario_at" | "createdAt" | "updatedAt";
export type ct_moduloCreationAttributes = Optional<ct_moduloAttributes, ct_moduloOptionalAttributes>;

export class ct_modulo extends Model<ct_moduloAttributes, ct_moduloCreationAttributes> implements ct_moduloAttributes {
  id_modulo!: number;
  nombre_modulo!: string;
  modulo_padre?: number;
  clave?: string;
  icono?: string;
  estado!: number;
  ct_usuario_in!: number;
  ct_usuario_at?: number;
  createdAt!: Date;
  updatedAt!: Date;

  // ct_modulo hasMany dt_funcion via ct_modulo_id
  dt_funcions!: dt_funcion[];
  getDt_funcions!: Sequelize.HasManyGetAssociationsMixin<dt_funcion>;
  setDt_funcions!: Sequelize.HasManySetAssociationsMixin<dt_funcion, dt_funcionId>;
  addDt_funcion!: Sequelize.HasManyAddAssociationMixin<dt_funcion, dt_funcionId>;
  addDt_funcions!: Sequelize.HasManyAddAssociationsMixin<dt_funcion, dt_funcionId>;
  createDt_funcion!: Sequelize.HasManyCreateAssociationMixin<dt_funcion>;
  removeDt_funcion!: Sequelize.HasManyRemoveAssociationMixin<dt_funcion, dt_funcionId>;
  removeDt_funcions!: Sequelize.HasManyRemoveAssociationsMixin<dt_funcion, dt_funcionId>;
  hasDt_funcion!: Sequelize.HasManyHasAssociationMixin<dt_funcion, dt_funcionId>;
  hasDt_funcions!: Sequelize.HasManyHasAssociationsMixin<dt_funcion, dt_funcionId>;
  countDt_funcions!: Sequelize.HasManyCountAssociationsMixin;
  // ct_modulo hasMany rl_modulo_area via ct_modulo_id
  rl_modulo_areas!: rl_modulo_area[];
  getRl_modulo_areas!: Sequelize.HasManyGetAssociationsMixin<rl_modulo_area>;
  setRl_modulo_areas!: Sequelize.HasManySetAssociationsMixin<rl_modulo_area, rl_modulo_areaId>;
  addRl_modulo_area!: Sequelize.HasManyAddAssociationMixin<rl_modulo_area, rl_modulo_areaId>;
  addRl_modulo_areas!: Sequelize.HasManyAddAssociationsMixin<rl_modulo_area, rl_modulo_areaId>;
  createRl_modulo_area!: Sequelize.HasManyCreateAssociationMixin<rl_modulo_area>;
  removeRl_modulo_area!: Sequelize.HasManyRemoveAssociationMixin<rl_modulo_area, rl_modulo_areaId>;
  removeRl_modulo_areas!: Sequelize.HasManyRemoveAssociationsMixin<rl_modulo_area, rl_modulo_areaId>;
  hasRl_modulo_area!: Sequelize.HasManyHasAssociationMixin<rl_modulo_area, rl_modulo_areaId>;
  hasRl_modulo_areas!: Sequelize.HasManyHasAssociationsMixin<rl_modulo_area, rl_modulo_areaId>;
  countRl_modulo_areas!: Sequelize.HasManyCountAssociationsMixin;
  // ct_modulo belongsTo ct_usuario via ct_usuario_in
  ct_usuario_in_ct_usuario!: ct_usuario;
  getCt_usuario_in_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_in_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_in_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // ct_modulo belongsTo ct_usuario via ct_usuario_at
  ct_usuario_at_ct_usuario!: ct_usuario;
  getCt_usuario_at_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_at_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_at_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;

  static initModel(sequelize: Sequelize.Sequelize): typeof ct_modulo {
    return ct_modulo.init({
    id_modulo: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre_modulo: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    modulo_padre: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    clave: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: ""
    },
    icono: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: ""
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    ct_usuario_in: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ct_usuario',
        key: 'id_usuario'
      }
    },
    ct_usuario_at: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'ct_usuario',
        key: 'id_usuario'
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
    tableName: 'ct_modulo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_modulo" },
        ]
      },
      {
        name: "fk_ct_modulo_creado_por",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_in" },
        ]
      },
      {
        name: "fk_ct_modulo_actualizado_por",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_at" },
        ]
      },
    ]
  });
  }
}
