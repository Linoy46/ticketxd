import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_partida, ct_partidaId } from './ct_partida';
import type { ct_unidad_medida, ct_unidad_medidaId } from './ct_unidad_medida';
import type { ct_usuario, ct_usuarioId } from './ct_usuario';
import type { rl_producto_area, rl_producto_areaId } from './rl_producto_area';
import type { rl_producto_requisicion, rl_producto_requisicionId } from './rl_producto_requisicion';

export interface ct_producto_consumibleAttributes {
  id_producto: number;
  ct_partida_id: number;
  nombre_producto: string;
  precio: number;
  ct_unidad_id?: number;
  estado: number;
  ct_usuario_in: number;
  ct_usuario_at?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ct_producto_consumiblePk = "id_producto";
export type ct_producto_consumibleId = ct_producto_consumible[ct_producto_consumiblePk];
export type ct_producto_consumibleOptionalAttributes = "id_producto" | "ct_partida_id" | "precio" | "ct_unidad_id" | "estado" | "ct_usuario_in" | "ct_usuario_at" | "createdAt" | "updatedAt";
export type ct_producto_consumibleCreationAttributes = Optional<ct_producto_consumibleAttributes, ct_producto_consumibleOptionalAttributes>;

export class ct_producto_consumible extends Model<ct_producto_consumibleAttributes, ct_producto_consumibleCreationAttributes> implements ct_producto_consumibleAttributes {
  id_producto!: number;
  ct_partida_id!: number;
  nombre_producto!: string;
  precio!: number;
  ct_unidad_id?: number;
  estado!: number;
  ct_usuario_in!: number;
  ct_usuario_at?: number;
  createdAt?: Date;
  updatedAt?: Date;

  // ct_producto_consumible belongsTo ct_partida via ct_partida_id
  ct_partida!: ct_partida;
  getCt_partida!: Sequelize.BelongsToGetAssociationMixin<ct_partida>;
  setCt_partida!: Sequelize.BelongsToSetAssociationMixin<ct_partida, ct_partidaId>;
  createCt_partida!: Sequelize.BelongsToCreateAssociationMixin<ct_partida>;
  // ct_producto_consumible hasMany rl_producto_area via id_producto
  rl_producto_areas!: rl_producto_area[];
  getRl_producto_areas!: Sequelize.HasManyGetAssociationsMixin<rl_producto_area>;
  setRl_producto_areas!: Sequelize.HasManySetAssociationsMixin<rl_producto_area, rl_producto_areaId>;
  addRl_producto_area!: Sequelize.HasManyAddAssociationMixin<rl_producto_area, rl_producto_areaId>;
  addRl_producto_areas!: Sequelize.HasManyAddAssociationsMixin<rl_producto_area, rl_producto_areaId>;
  createRl_producto_area!: Sequelize.HasManyCreateAssociationMixin<rl_producto_area>;
  removeRl_producto_area!: Sequelize.HasManyRemoveAssociationMixin<rl_producto_area, rl_producto_areaId>;
  removeRl_producto_areas!: Sequelize.HasManyRemoveAssociationsMixin<rl_producto_area, rl_producto_areaId>;
  hasRl_producto_area!: Sequelize.HasManyHasAssociationMixin<rl_producto_area, rl_producto_areaId>;
  hasRl_producto_areas!: Sequelize.HasManyHasAssociationsMixin<rl_producto_area, rl_producto_areaId>;
  countRl_producto_areas!: Sequelize.HasManyCountAssociationsMixin;
  // ct_producto_consumible hasMany rl_producto_requisicion via ct_productos_id
  rl_producto_requisicions!: rl_producto_requisicion[];
  getRl_producto_requisicions!: Sequelize.HasManyGetAssociationsMixin<rl_producto_requisicion>;
  setRl_producto_requisicions!: Sequelize.HasManySetAssociationsMixin<rl_producto_requisicion, rl_producto_requisicionId>;
  addRl_producto_requisicion!: Sequelize.HasManyAddAssociationMixin<rl_producto_requisicion, rl_producto_requisicionId>;
  addRl_producto_requisicions!: Sequelize.HasManyAddAssociationsMixin<rl_producto_requisicion, rl_producto_requisicionId>;
  createRl_producto_requisicion!: Sequelize.HasManyCreateAssociationMixin<rl_producto_requisicion>;
  removeRl_producto_requisicion!: Sequelize.HasManyRemoveAssociationMixin<rl_producto_requisicion, rl_producto_requisicionId>;
  removeRl_producto_requisicions!: Sequelize.HasManyRemoveAssociationsMixin<rl_producto_requisicion, rl_producto_requisicionId>;
  hasRl_producto_requisicion!: Sequelize.HasManyHasAssociationMixin<rl_producto_requisicion, rl_producto_requisicionId>;
  hasRl_producto_requisicions!: Sequelize.HasManyHasAssociationsMixin<rl_producto_requisicion, rl_producto_requisicionId>;
  countRl_producto_requisicions!: Sequelize.HasManyCountAssociationsMixin;
  // ct_producto_consumible belongsTo ct_unidad_medida via ct_unidad_id
  ct_unidad!: ct_unidad_medida;
  getCt_unidad!: Sequelize.BelongsToGetAssociationMixin<ct_unidad_medida>;
  setCt_unidad!: Sequelize.BelongsToSetAssociationMixin<ct_unidad_medida, ct_unidad_medidaId>;
  createCt_unidad!: Sequelize.BelongsToCreateAssociationMixin<ct_unidad_medida>;
  // ct_producto_consumible belongsTo ct_usuario via ct_usuario_in
  ct_usuario_in_ct_usuario!: ct_usuario;
  getCt_usuario_in_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_in_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_in_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // ct_producto_consumible belongsTo ct_usuario via ct_usuario_at
  ct_usuario_at_ct_usuario!: ct_usuario;
  getCt_usuario_at_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_at_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_at_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;

  static initModel(sequelize: Sequelize.Sequelize): typeof ct_producto_consumible {
    return ct_producto_consumible.init({
    id_producto: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ct_partida_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: 'ct_partida',
        key: 'id_partida'
      }
    },
    nombre_producto: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    precio: {
      type: DataTypes.DECIMAL(20,2),
      allowNull: false,
      defaultValue: 0.00
    },
    ct_unidad_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'ct_unidad_medida',
        key: 'id_unidad'
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
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'ct_producto_consumible',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_producto" },
        ]
      },
      {
        name: "fk_ct_producto_consumible_unidad",
        using: "BTREE",
        fields: [
          { name: "ct_unidad_id" },
        ]
      },
      {
        name: "fk_ct_producto_consumible_creado_por",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_in" },
        ]
      },
      {
        name: "fk_ct_producto_consumible_actualizado_por",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_at" },
        ]
      },
      {
        name: "fk_ct_producto_consumible_ct_partida",
        using: "BTREE",
        fields: [
          { name: "ct_partida_id" },
        ]
      },
    ]
  });
  }
}
