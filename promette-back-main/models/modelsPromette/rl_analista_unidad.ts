import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_usuario, ct_usuarioId } from './ct_usuario';
import type { rl_area_financiero, rl_area_financieroId } from './rl_area_financiero';

export interface rl_analista_unidadAttributes {
  id_puesto_unidad: number;
  ct_usuario_id: number;
  rl_area_financiero: number;
  estado: number;
  createdAt: Date;
  updatedAt?: Date;
  ct_usuario_in: number;
  ct_usuario_at?: number;
}

export type rl_analista_unidadPk = "id_puesto_unidad";
export type rl_analista_unidadId = rl_analista_unidad[rl_analista_unidadPk];
export type rl_analista_unidadOptionalAttributes = "id_puesto_unidad" | "ct_usuario_id" | "rl_area_financiero" | "estado" | "createdAt" | "updatedAt" | "ct_usuario_in" | "ct_usuario_at";
export type rl_analista_unidadCreationAttributes = Optional<rl_analista_unidadAttributes, rl_analista_unidadOptionalAttributes>;

export class rl_analista_unidad extends Model<rl_analista_unidadAttributes, rl_analista_unidadCreationAttributes> implements rl_analista_unidadAttributes {
  id_puesto_unidad!: number;
  ct_usuario_id!: number;
  rl_area_financiero!: number;
  estado!: number;
  createdAt!: Date;
  updatedAt?: Date;
  ct_usuario_in!: number;
  ct_usuario_at?: number;

  // rl_analista_unidad belongsTo ct_usuario via ct_usuario_id
  ct_usuario!: ct_usuario;
  getCt_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // rl_analista_unidad belongsTo ct_usuario via ct_usuario_in
  ct_usuario_in_ct_usuario!: ct_usuario;
  getCt_usuario_in_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_in_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_in_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // rl_analista_unidad belongsTo rl_area_financiero via rl_area_financiero
  rl_area_financiero_rl_area_financiero!: rl_area_financiero;
  getRl_area_financiero_rl_area_financiero!: Sequelize.BelongsToGetAssociationMixin<rl_area_financiero>;
  setRl_area_financiero_rl_area_financiero!: Sequelize.BelongsToSetAssociationMixin<rl_area_financiero, rl_area_financieroId>;
  createRl_area_financiero_rl_area_financiero!: Sequelize.BelongsToCreateAssociationMixin<rl_area_financiero>;

  static initModel(sequelize: Sequelize.Sequelize): typeof rl_analista_unidad {
    return rl_analista_unidad.init({
    id_puesto_unidad: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ct_usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: 'ct_usuario',
        key: 'id_usuario'
      }
    },
    rl_area_financiero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      references: {
        model: 'rl_area_financiero',
        key: 'id_area_fin'
      }
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
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
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
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'rl_analista_unidad',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_puesto_unidad" },
        ]
      },
      {
        name: "FK_rl_analista_unidad_ct_usuario",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_in" },
        ]
      },
      {
        name: "FK_rl_analista_unidad_ct_usuario_2",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_id" },
        ]
      },
      {
        name: "fk_ct_area_id_area",
        using: "BTREE",
        fields: [
          { name: "rl_area_financiero" },
        ]
      },
    ]
  });
  }
}
