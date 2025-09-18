import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_puesto, ct_puestoId } from './ct_puesto';
import type { dt_funcion, dt_funcionId } from './dt_funcion';

export interface rl_puesto_funcionAttributes {
  id_puesto_funcion: number;
  ct_puesto_id?: number;
  dt_funcion_id?: number;
}

export type rl_puesto_funcionPk = "id_puesto_funcion";
export type rl_puesto_funcionId = rl_puesto_funcion[rl_puesto_funcionPk];
export type rl_puesto_funcionOptionalAttributes = "id_puesto_funcion" | "ct_puesto_id" | "dt_funcion_id";
export type rl_puesto_funcionCreationAttributes = Optional<rl_puesto_funcionAttributes, rl_puesto_funcionOptionalAttributes>;

export class rl_puesto_funcion extends Model<rl_puesto_funcionAttributes, rl_puesto_funcionCreationAttributes> implements rl_puesto_funcionAttributes {
  id_puesto_funcion!: number;
  ct_puesto_id?: number;
  dt_funcion_id?: number;

  // rl_puesto_funcion belongsTo ct_puesto via ct_puesto_id
  ct_puesto!: ct_puesto;
  getCt_puesto!: Sequelize.BelongsToGetAssociationMixin<ct_puesto>;
  setCt_puesto!: Sequelize.BelongsToSetAssociationMixin<ct_puesto, ct_puestoId>;
  createCt_puesto!: Sequelize.BelongsToCreateAssociationMixin<ct_puesto>;
  // rl_puesto_funcion belongsTo dt_funcion via dt_funcion_id
  dt_funcion!: dt_funcion;
  getDt_funcion!: Sequelize.BelongsToGetAssociationMixin<dt_funcion>;
  setDt_funcion!: Sequelize.BelongsToSetAssociationMixin<dt_funcion, dt_funcionId>;
  createDt_funcion!: Sequelize.BelongsToCreateAssociationMixin<dt_funcion>;

  static initModel(sequelize: Sequelize.Sequelize): typeof rl_puesto_funcion {
    return rl_puesto_funcion.init({
    id_puesto_funcion: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ct_puesto_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'ct_puesto',
        key: 'id_puesto'
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
    tableName: 'rl_puesto_funcion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_puesto_funcion" },
        ]
      },
      {
        name: "fk_rl_puesto_funcion_puesto",
        using: "BTREE",
        fields: [
          { name: "ct_puesto_id" },
        ]
      },
      {
        name: "fk_rl_puesto_funcion_funcion",
        using: "BTREE",
        fields: [
          { name: "dt_funcion_id" },
        ]
      },
    ]
  });
  }
}
