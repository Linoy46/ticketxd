import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_modulo, ct_moduloId } from './ct_modulo';
import type { ct_usuario, ct_usuarioId } from './ct_usuario';
import type { rl_puesto_funcion, rl_puesto_funcionId } from './rl_puesto_funcion';
import type { rl_usuario_funcion, rl_usuario_funcionId } from './rl_usuario_funcion';

export interface dt_funcionAttributes {
  id_funcion: number;
  ct_modulo_id?: number;
  nombre_funcion: string;
  descripcion?: string;
  estado: number;
  ct_usuario_in: number;
  ct_usuario_at?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type dt_funcionPk = "id_funcion";
export type dt_funcionId = dt_funcion[dt_funcionPk];
export type dt_funcionOptionalAttributes = "id_funcion" | "ct_modulo_id" | "descripcion" | "estado" | "ct_usuario_at" | "createdAt" | "updatedAt";
export type dt_funcionCreationAttributes = Optional<dt_funcionAttributes, dt_funcionOptionalAttributes>;

export class dt_funcion extends Model<dt_funcionAttributes, dt_funcionCreationAttributes> implements dt_funcionAttributes {
  id_funcion!: number;
  ct_modulo_id?: number;
  nombre_funcion!: string;
  descripcion?: string;
  estado!: number;
  ct_usuario_in!: number;
  ct_usuario_at?: number;
  createdAt!: Date;
  updatedAt!: Date;

  // dt_funcion belongsTo ct_modulo via ct_modulo_id
  ct_modulo!: ct_modulo;
  getCt_modulo!: Sequelize.BelongsToGetAssociationMixin<ct_modulo>;
  setCt_modulo!: Sequelize.BelongsToSetAssociationMixin<ct_modulo, ct_moduloId>;
  createCt_modulo!: Sequelize.BelongsToCreateAssociationMixin<ct_modulo>;
  // dt_funcion belongsTo ct_usuario via ct_usuario_in
  ct_usuario_in_ct_usuario!: ct_usuario;
  getCt_usuario_in_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_in_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_in_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // dt_funcion belongsTo ct_usuario via ct_usuario_at
  ct_usuario_at_ct_usuario!: ct_usuario;
  getCt_usuario_at_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_at_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_at_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // dt_funcion hasMany rl_puesto_funcion via dt_funcion_id
  rl_puesto_funcions!: rl_puesto_funcion[];
  getRl_puesto_funcions!: Sequelize.HasManyGetAssociationsMixin<rl_puesto_funcion>;
  setRl_puesto_funcions!: Sequelize.HasManySetAssociationsMixin<rl_puesto_funcion, rl_puesto_funcionId>;
  addRl_puesto_funcion!: Sequelize.HasManyAddAssociationMixin<rl_puesto_funcion, rl_puesto_funcionId>;
  addRl_puesto_funcions!: Sequelize.HasManyAddAssociationsMixin<rl_puesto_funcion, rl_puesto_funcionId>;
  createRl_puesto_funcion!: Sequelize.HasManyCreateAssociationMixin<rl_puesto_funcion>;
  removeRl_puesto_funcion!: Sequelize.HasManyRemoveAssociationMixin<rl_puesto_funcion, rl_puesto_funcionId>;
  removeRl_puesto_funcions!: Sequelize.HasManyRemoveAssociationsMixin<rl_puesto_funcion, rl_puesto_funcionId>;
  hasRl_puesto_funcion!: Sequelize.HasManyHasAssociationMixin<rl_puesto_funcion, rl_puesto_funcionId>;
  hasRl_puesto_funcions!: Sequelize.HasManyHasAssociationsMixin<rl_puesto_funcion, rl_puesto_funcionId>;
  countRl_puesto_funcions!: Sequelize.HasManyCountAssociationsMixin;
  // dt_funcion hasMany rl_usuario_funcion via dt_funcion_id
  rl_usuario_funcions!: rl_usuario_funcion[];
  getRl_usuario_funcions!: Sequelize.HasManyGetAssociationsMixin<rl_usuario_funcion>;
  setRl_usuario_funcions!: Sequelize.HasManySetAssociationsMixin<rl_usuario_funcion, rl_usuario_funcionId>;
  addRl_usuario_funcion!: Sequelize.HasManyAddAssociationMixin<rl_usuario_funcion, rl_usuario_funcionId>;
  addRl_usuario_funcions!: Sequelize.HasManyAddAssociationsMixin<rl_usuario_funcion, rl_usuario_funcionId>;
  createRl_usuario_funcion!: Sequelize.HasManyCreateAssociationMixin<rl_usuario_funcion>;
  removeRl_usuario_funcion!: Sequelize.HasManyRemoveAssociationMixin<rl_usuario_funcion, rl_usuario_funcionId>;
  removeRl_usuario_funcions!: Sequelize.HasManyRemoveAssociationsMixin<rl_usuario_funcion, rl_usuario_funcionId>;
  hasRl_usuario_funcion!: Sequelize.HasManyHasAssociationMixin<rl_usuario_funcion, rl_usuario_funcionId>;
  hasRl_usuario_funcions!: Sequelize.HasManyHasAssociationsMixin<rl_usuario_funcion, rl_usuario_funcionId>;
  countRl_usuario_funcions!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof dt_funcion {
    return dt_funcion.init({
    id_funcion: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ct_modulo_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'ct_modulo',
        key: 'id_modulo'
      }
    },
    nombre_funcion: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true
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
    tableName: 'dt_funcion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_funcion" },
        ]
      },
      {
        name: "fk_dt_funcion_ct_modulo",
        using: "BTREE",
        fields: [
          { name: "ct_modulo_id" },
        ]
      },
      {
        name: "fk_dt_funcion_creado_por",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_in" },
        ]
      },
      {
        name: "fk_dt_funcion_actualizado_por",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_at" },
        ]
      },
    ]
  });
  }
}
