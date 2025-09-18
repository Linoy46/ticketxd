import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_modulo, ct_moduloId } from './ct_modulo';

export interface rl_modulo_areaAttributes {
  id_modulo_area: number;
  ct_modulo_id?: number;
  ct_area_id?: number;
}

export type rl_modulo_areaPk = "id_modulo_area";
export type rl_modulo_areaId = rl_modulo_area[rl_modulo_areaPk];
export type rl_modulo_areaOptionalAttributes = "id_modulo_area" | "ct_modulo_id" | "ct_area_id";
export type rl_modulo_areaCreationAttributes = Optional<rl_modulo_areaAttributes, rl_modulo_areaOptionalAttributes>;

export class rl_modulo_area extends Model<rl_modulo_areaAttributes, rl_modulo_areaCreationAttributes> implements rl_modulo_areaAttributes {
  id_modulo_area!: number;
  ct_modulo_id?: number;
  ct_area_id?: number;

  // rl_modulo_area belongsTo ct_modulo via ct_modulo_id
  ct_modulo!: ct_modulo;
  getCt_modulo!: Sequelize.BelongsToGetAssociationMixin<ct_modulo>;
  setCt_modulo!: Sequelize.BelongsToSetAssociationMixin<ct_modulo, ct_moduloId>;
  createCt_modulo!: Sequelize.BelongsToCreateAssociationMixin<ct_modulo>;

  static initModel(sequelize: Sequelize.Sequelize): typeof rl_modulo_area {
    return rl_modulo_area.init({
    id_modulo_area: {
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
    ct_area_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'rl_modulo_area',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_modulo_area" },
        ]
      },
      {
        name: "fk_rl_modulo_area_modulo_id",
        using: "BTREE",
        fields: [
          { name: "ct_modulo_id" },
        ]
      },
      {
        name: "fk_rl_modulo_area_area_id",
        using: "BTREE",
        fields: [
          { name: "ct_area_id" },
        ]
      },
    ]
  });
  }
}
