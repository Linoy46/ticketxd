import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_capitulo, ct_capituloId } from './ct_capitulo';
import type { ct_producto_consumible, ct_producto_consumibleId } from './ct_producto_consumible';
import type { dt_consumible_inventario, dt_consumible_inventarioId } from './dt_consumible_inventario';
import type { rl_justificacion, rl_justificacionId } from './rl_justificacion';
import type { rl_partida_area, rl_partida_areaId } from './rl_partida_area';

export interface ct_partidaAttributes {
  id_partida: number;
  ct_capitulo_id: number;
  clave_partida: string;
  nombre_partida: string;
  estado: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ct_partidaPk = "id_partida";
export type ct_partidaId = ct_partida[ct_partidaPk];
export type ct_partidaOptionalAttributes = "id_partida" | "estado" | "createdAt" | "updatedAt";
export type ct_partidaCreationAttributes = Optional<ct_partidaAttributes, ct_partidaOptionalAttributes>;

export class ct_partida extends Model<ct_partidaAttributes, ct_partidaCreationAttributes> implements ct_partidaAttributes {
  id_partida!: number;
  ct_capitulo_id!: number;
  clave_partida!: string;
  nombre_partida!: string;
  estado!: number;
  createdAt!: Date;
  updatedAt!: Date;

  // ct_partida belongsTo ct_capitulo via ct_capitulo_id
  ct_capitulo!: ct_capitulo;
  getCt_capitulo!: Sequelize.BelongsToGetAssociationMixin<ct_capitulo>;
  setCt_capitulo!: Sequelize.BelongsToSetAssociationMixin<ct_capitulo, ct_capituloId>;
  createCt_capitulo!: Sequelize.BelongsToCreateAssociationMixin<ct_capitulo>;
  // ct_partida hasMany ct_producto_consumible via ct_partida_id
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
  // ct_partida hasMany dt_consumible_inventario via ct_partida_id
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
  // ct_partida hasMany rl_justificacion via ct_partida_id
  rl_justificacions!: rl_justificacion[];
  getRl_justificacions!: Sequelize.HasManyGetAssociationsMixin<rl_justificacion>;
  setRl_justificacions!: Sequelize.HasManySetAssociationsMixin<rl_justificacion, rl_justificacionId>;
  addRl_justificacion!: Sequelize.HasManyAddAssociationMixin<rl_justificacion, rl_justificacionId>;
  addRl_justificacions!: Sequelize.HasManyAddAssociationsMixin<rl_justificacion, rl_justificacionId>;
  createRl_justificacion!: Sequelize.HasManyCreateAssociationMixin<rl_justificacion>;
  removeRl_justificacion!: Sequelize.HasManyRemoveAssociationMixin<rl_justificacion, rl_justificacionId>;
  removeRl_justificacions!: Sequelize.HasManyRemoveAssociationsMixin<rl_justificacion, rl_justificacionId>;
  hasRl_justificacion!: Sequelize.HasManyHasAssociationMixin<rl_justificacion, rl_justificacionId>;
  hasRl_justificacions!: Sequelize.HasManyHasAssociationsMixin<rl_justificacion, rl_justificacionId>;
  countRl_justificacions!: Sequelize.HasManyCountAssociationsMixin;
  // ct_partida hasMany rl_partida_area via id_partida
  rl_partida_areas!: rl_partida_area[];
  getRl_partida_areas!: Sequelize.HasManyGetAssociationsMixin<rl_partida_area>;
  setRl_partida_areas!: Sequelize.HasManySetAssociationsMixin<rl_partida_area, rl_partida_areaId>;
  addRl_partida_area!: Sequelize.HasManyAddAssociationMixin<rl_partida_area, rl_partida_areaId>;
  addRl_partida_areas!: Sequelize.HasManyAddAssociationsMixin<rl_partida_area, rl_partida_areaId>;
  createRl_partida_area!: Sequelize.HasManyCreateAssociationMixin<rl_partida_area>;
  removeRl_partida_area!: Sequelize.HasManyRemoveAssociationMixin<rl_partida_area, rl_partida_areaId>;
  removeRl_partida_areas!: Sequelize.HasManyRemoveAssociationsMixin<rl_partida_area, rl_partida_areaId>;
  hasRl_partida_area!: Sequelize.HasManyHasAssociationMixin<rl_partida_area, rl_partida_areaId>;
  hasRl_partida_areas!: Sequelize.HasManyHasAssociationsMixin<rl_partida_area, rl_partida_areaId>;
  countRl_partida_areas!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof ct_partida {
    return ct_partida.init({
    id_partida: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ct_capitulo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ct_capitulo',
        key: 'id_capitulo'
      }
    },
    clave_partida: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    nombre_partida: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
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
    tableName: 'ct_partida',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_partida" },
        ]
      },
      {
        name: "FK_ct_partida_ct_capitulo",
        using: "BTREE",
        fields: [
          { name: "ct_capitulo_id" },
        ]
      },
    ]
  });
  }
}
