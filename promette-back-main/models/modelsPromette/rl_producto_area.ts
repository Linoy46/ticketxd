import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_producto_consumible, ct_producto_consumibleId } from './ct_producto_consumible';
import type { rl_area_financiero, rl_area_financieroId } from './rl_area_financiero';

export interface rl_producto_areaAttributes {
  id_producto_area: number;
  id_producto: number;
  id_area_infra: number;
  ct_usuario_in: number;
  ct_usuario_at?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export type rl_producto_areaPk = "id_producto_area";
export type rl_producto_areaId = rl_producto_area[rl_producto_areaPk];
export type rl_producto_areaOptionalAttributes = "id_producto_area" | "ct_usuario_in" | "ct_usuario_at" | "createdAt" | "updatedAt";
export type rl_producto_areaCreationAttributes = Optional<rl_producto_areaAttributes, rl_producto_areaOptionalAttributes>;

export class rl_producto_area extends Model<rl_producto_areaAttributes, rl_producto_areaCreationAttributes> implements rl_producto_areaAttributes {
  id_producto_area!: number;
  id_producto!: number;
  id_area_infra!: number;
  ct_usuario_in!: number;
  ct_usuario_at?: number;
  createdAt!: Date;
  updatedAt?: Date;

  // rl_producto_area belongsTo ct_producto_consumible via id_producto
  id_producto_ct_producto_consumible!: ct_producto_consumible;
  getId_producto_ct_producto_consumible!: Sequelize.BelongsToGetAssociationMixin<ct_producto_consumible>;
  setId_producto_ct_producto_consumible!: Sequelize.BelongsToSetAssociationMixin<ct_producto_consumible, ct_producto_consumibleId>;
  createId_producto_ct_producto_consumible!: Sequelize.BelongsToCreateAssociationMixin<ct_producto_consumible>;
  // rl_producto_area belongsTo rl_area_financiero via id_area_infra
  id_area_infra_rl_area_financiero!: rl_area_financiero;
  getId_area_infra_rl_area_financiero!: Sequelize.BelongsToGetAssociationMixin<rl_area_financiero>;
  setId_area_infra_rl_area_financiero!: Sequelize.BelongsToSetAssociationMixin<rl_area_financiero, rl_area_financieroId>;
  createId_area_infra_rl_area_financiero!: Sequelize.BelongsToCreateAssociationMixin<rl_area_financiero>;

  static initModel(sequelize: Sequelize.Sequelize): typeof rl_producto_area {
    return rl_producto_area.init({
    id_producto_area: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ct_producto_consumible',
        key: 'id_producto'
      }
    },
    id_area_infra: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'rl_area_financiero',
        key: 'id_area_fin'
      }
    },
    ct_usuario_in: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    ct_usuario_at: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'rl_producto_area',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_producto_area" },
        ]
      },
      {
        name: "FK_rl_producto_area_ct_producto_consumible",
        using: "BTREE",
        fields: [
          { name: "id_producto" },
        ]
      },
      {
        name: "FK_rl_producto_area_rl_area_financiero",
        using: "BTREE",
        fields: [
          { name: "id_area_infra" },
        ]
      },
    ]
  });
  }
}
