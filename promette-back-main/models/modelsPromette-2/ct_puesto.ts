import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_usuario, ct_usuarioId } from './ct_usuario';
import type { rl_puesto_funcion, rl_puesto_funcionId } from './rl_puesto_funcion';
import type { rl_usuario_puesto, rl_usuario_puestoId } from './rl_usuario_puesto';

export interface ct_puestoAttributes {
  id_puesto: number;
  nombre_puesto: string;
  descripcion?: string;
  ct_area_id: number;
  ct_puesto_superior_id?: number;
  estado: number;
  ct_usuario_in: number;
  ct_usuario_at?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ct_puestoPk = "id_puesto";
export type ct_puestoId = ct_puesto[ct_puestoPk];
export type ct_puestoOptionalAttributes = "id_puesto" | "descripcion" | "ct_puesto_superior_id" | "estado" | "ct_usuario_in" | "ct_usuario_at" | "createdAt" | "updatedAt";
export type ct_puestoCreationAttributes = Optional<ct_puestoAttributes, ct_puestoOptionalAttributes>;

export class ct_puesto extends Model<ct_puestoAttributes, ct_puestoCreationAttributes> implements ct_puestoAttributes {
  id_puesto!: number;
  nombre_puesto!: string;
  descripcion?: string;
  ct_area_id!: number;
  ct_puesto_superior_id?: number;
  estado!: number;
  ct_usuario_in!: number;
  ct_usuario_at?: number;
  createdAt!: Date;
  updatedAt!: Date;

  // ct_puesto belongsTo ct_puesto via ct_puesto_superior_id
  ct_puesto_superior!: ct_puesto;
  getCt_puesto_superior!: Sequelize.BelongsToGetAssociationMixin<ct_puesto>;
  setCt_puesto_superior!: Sequelize.BelongsToSetAssociationMixin<ct_puesto, ct_puestoId>;
  createCt_puesto_superior!: Sequelize.BelongsToCreateAssociationMixin<ct_puesto>;
  // ct_puesto hasMany rl_puesto_funcion via ct_puesto_id
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
  // ct_puesto hasMany rl_usuario_puesto via ct_puesto_id
  rl_usuario_puestos!: rl_usuario_puesto[];
  getRl_usuario_puestos!: Sequelize.HasManyGetAssociationsMixin<rl_usuario_puesto>;
  setRl_usuario_puestos!: Sequelize.HasManySetAssociationsMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  addRl_usuario_puesto!: Sequelize.HasManyAddAssociationMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  addRl_usuario_puestos!: Sequelize.HasManyAddAssociationsMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  createRl_usuario_puesto!: Sequelize.HasManyCreateAssociationMixin<rl_usuario_puesto>;
  removeRl_usuario_puesto!: Sequelize.HasManyRemoveAssociationMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  removeRl_usuario_puestos!: Sequelize.HasManyRemoveAssociationsMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  hasRl_usuario_puesto!: Sequelize.HasManyHasAssociationMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  hasRl_usuario_puestos!: Sequelize.HasManyHasAssociationsMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  countRl_usuario_puestos!: Sequelize.HasManyCountAssociationsMixin;
  // ct_puesto belongsTo ct_usuario via ct_usuario_in
  ct_usuario_in_ct_usuario!: ct_usuario;
  getCt_usuario_in_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_in_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_in_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // ct_puesto belongsTo ct_usuario via ct_usuario_at
  ct_usuario_at_ct_usuario!: ct_usuario;
  getCt_usuario_at_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_at_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_at_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;

  static initModel(sequelize: Sequelize.Sequelize): typeof ct_puesto {
    return ct_puesto.init({
    id_puesto: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre_puesto: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ct_area_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ct_puesto_superior_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'ct_puesto',
        key: 'id_puesto'
      }
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    ct_usuario_in: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
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
    tableName: 'ct_puesto',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_puesto" },
        ]
      },
      {
        name: "fk_ct_puesto_area",
        using: "BTREE",
        fields: [
          { name: "ct_area_id" },
        ]
      },
      {
        name: "fk_ct_puesto_superior",
        using: "BTREE",
        fields: [
          { name: "ct_puesto_superior_id" },
        ]
      },
      {
        name: "fk_ct_puesto_creado_por",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_in" },
        ]
      },
      {
        name: "fk_ct_puesto_actualizado_por",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_at" },
        ]
      },
    ]
  });
  }
}
