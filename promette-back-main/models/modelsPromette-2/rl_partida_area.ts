import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_partida, ct_partidaId } from './ct_partida';
import type { rl_area_financiero, rl_area_financieroId } from './rl_area_financiero';

export interface rl_partida_areaAttributes {
  id_partida_area: number;
  id_area_infra: number;
  id_partida: number;
  createdAt: Date;
  updatedAt?: Date;
  ct_usuario_in: number;
  ct_usuario_at?: number;
}

export type rl_partida_areaPk = "id_partida_area";
export type rl_partida_areaId = rl_partida_area[rl_partida_areaPk];
export type rl_partida_areaOptionalAttributes = "id_partida_area" | "id_area_infra" | "id_partida" | "updatedAt" | "ct_usuario_in" | "ct_usuario_at";
export type rl_partida_areaCreationAttributes = Optional<rl_partida_areaAttributes, rl_partida_areaOptionalAttributes>;

export class rl_partida_area extends Model<rl_partida_areaAttributes, rl_partida_areaCreationAttributes> implements rl_partida_areaAttributes {
  id_partida_area!: number;
  id_area_infra!: number;
  id_partida!: number;
  createdAt!: Date;
  updatedAt?: Date;
  ct_usuario_in!: number;
  ct_usuario_at?: number;

  // rl_partida_area belongsTo ct_partida via id_partida
  id_partida_ct_partida!: ct_partida;
  getId_partida_ct_partida!: Sequelize.BelongsToGetAssociationMixin<ct_partida>;
  setId_partida_ct_partida!: Sequelize.BelongsToSetAssociationMixin<ct_partida, ct_partidaId>;
  createId_partida_ct_partida!: Sequelize.BelongsToCreateAssociationMixin<ct_partida>;
  // rl_partida_area belongsTo rl_area_financiero via id_area_infra
  id_area_infra_rl_area_financiero!: rl_area_financiero;
  getId_area_infra_rl_area_financiero!: Sequelize.BelongsToGetAssociationMixin<rl_area_financiero>;
  setId_area_infra_rl_area_financiero!: Sequelize.BelongsToSetAssociationMixin<rl_area_financiero, rl_area_financieroId>;
  createId_area_infra_rl_area_financiero!: Sequelize.BelongsToCreateAssociationMixin<rl_area_financiero>;

  static initModel(sequelize: Sequelize.Sequelize): typeof rl_partida_area {
    return rl_partida_area.init({
    id_partida_area: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_area_infra: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: 'rl_area_financiero',
        key: 'id_area_fin'
      }
    },
    id_partida: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: 'ct_partida',
        key: 'id_partida'
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ct_usuario_in: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    ct_usuario_at: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'rl_partida_area',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_partida_area" },
        ]
      },
      {
        name: "FK_rl_partida_area_ct_partida",
        using: "BTREE",
        fields: [
          { name: "id_partida" },
        ]
      },
      {
        name: "FK_rl_partida_area_rl_area_financiero",
        using: "BTREE",
        fields: [
          { name: "id_area_infra" },
        ]
      },
    ]
  });
  }
}
