import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_usuario, ct_usuarioId } from './ct_usuario';
import type { dt_funcion, dt_funcionId } from './dt_funcion';

export interface rl_usuario_funcionAttributes {
  id_usuario_funcion: number;
  ct_usuario_id?: number;
  dt_funcion_id?: number;
}

export type rl_usuario_funcionPk = "id_usuario_funcion";
export type rl_usuario_funcionId = rl_usuario_funcion[rl_usuario_funcionPk];
export type rl_usuario_funcionOptionalAttributes = "id_usuario_funcion" | "ct_usuario_id" | "dt_funcion_id";
export type rl_usuario_funcionCreationAttributes = Optional<rl_usuario_funcionAttributes, rl_usuario_funcionOptionalAttributes>;

export class rl_usuario_funcion extends Model<rl_usuario_funcionAttributes, rl_usuario_funcionCreationAttributes> implements rl_usuario_funcionAttributes {
  id_usuario_funcion!: number;
  ct_usuario_id?: number;
  dt_funcion_id?: number;

  // rl_usuario_funcion belongsTo ct_usuario via ct_usuario_id
  ct_usuario!: ct_usuario;
  getCt_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // rl_usuario_funcion belongsTo dt_funcion via dt_funcion_id
  dt_funcion!: dt_funcion;
  getDt_funcion!: Sequelize.BelongsToGetAssociationMixin<dt_funcion>;
  setDt_funcion!: Sequelize.BelongsToSetAssociationMixin<dt_funcion, dt_funcionId>;
  createDt_funcion!: Sequelize.BelongsToCreateAssociationMixin<dt_funcion>;

  static initModel(sequelize: Sequelize.Sequelize): typeof rl_usuario_funcion {
    return rl_usuario_funcion.init({
    id_usuario_funcion: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ct_usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'ct_usuario',
        key: 'id_usuario'
      }
    },
    dt_funcion_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'dt_funcion',
        key: 'id_funcion'
      }
    }
  }, {
    sequelize,
    tableName: 'rl_usuario_funcion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_usuario_funcion" },
        ]
      },
      {
        name: "fk_rl_usuario_funcion_usuario",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_id" },
        ]
      },
      {
        name: "fk_rl_usuario_funcion_funcion",
        using: "BTREE",
        fields: [
          { name: "dt_funcion_id" },
        ]
      },
    ]
  });
  }
}
