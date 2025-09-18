import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_correspondencia_estado, ct_correspondencia_estadoId } from './ct_correspondencia_estado';
import type { ct_usuario, ct_usuarioId } from './ct_usuario';
import type { dt_correspondencia, dt_correspondenciaId } from './dt_correspondencia';
import type { rl_usuario_puesto, rl_usuario_puestoId } from './rl_usuario_puesto';

export interface rl_correspondencia_usuario_estadoAttributes {
  id_correspondencia_usuario: number;
  dt_correspondencia_id: number;
  rl_usuario_puesto_id: number;
  ct_correspondencia_estado: number;
  observaciones?: string;
  ct_usuarios_in: number;
  createdAt: Date;
}

export type rl_correspondencia_usuario_estadoPk = "id_correspondencia_usuario";
export type rl_correspondencia_usuario_estadoId = rl_correspondencia_usuario_estado[rl_correspondencia_usuario_estadoPk];
export type rl_correspondencia_usuario_estadoOptionalAttributes = "id_correspondencia_usuario" | "observaciones" | "createdAt";
export type rl_correspondencia_usuario_estadoCreationAttributes = Optional<rl_correspondencia_usuario_estadoAttributes, rl_correspondencia_usuario_estadoOptionalAttributes>;

export class rl_correspondencia_usuario_estado extends Model<rl_correspondencia_usuario_estadoAttributes, rl_correspondencia_usuario_estadoCreationAttributes> implements rl_correspondencia_usuario_estadoAttributes {
  id_correspondencia_usuario!: number;
  dt_correspondencia_id!: number;
  rl_usuario_puesto_id!: number;
  ct_correspondencia_estado!: number;
  observaciones?: string;
  ct_usuarios_in!: number;
  createdAt!: Date;

  // rl_correspondencia_usuario_estado belongsTo ct_correspondencia_estado via ct_correspondencia_estado
  ct_correspondencia_estado_ct_correspondencia_estado!: ct_correspondencia_estado;
  getCt_correspondencia_estado_ct_correspondencia_estado!: Sequelize.BelongsToGetAssociationMixin<ct_correspondencia_estado>;
  setCt_correspondencia_estado_ct_correspondencia_estado!: Sequelize.BelongsToSetAssociationMixin<ct_correspondencia_estado, ct_correspondencia_estadoId>;
  createCt_correspondencia_estado_ct_correspondencia_estado!: Sequelize.BelongsToCreateAssociationMixin<ct_correspondencia_estado>;
  // rl_correspondencia_usuario_estado belongsTo ct_usuario via ct_usuarios_in
  ct_usuarios_in_ct_usuario!: ct_usuario;
  getCt_usuarios_in_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuarios_in_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuarios_in_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // rl_correspondencia_usuario_estado belongsTo dt_correspondencia via dt_correspondencia_id
  dt_correspondencium!: dt_correspondencia;
  getDt_correspondencium!: Sequelize.BelongsToGetAssociationMixin<dt_correspondencia>;
  setDt_correspondencium!: Sequelize.BelongsToSetAssociationMixin<dt_correspondencia, dt_correspondenciaId>;
  createDt_correspondencium!: Sequelize.BelongsToCreateAssociationMixin<dt_correspondencia>;
  // rl_correspondencia_usuario_estado belongsTo rl_usuario_puesto via rl_usuario_puesto_id
  rl_usuario_puesto!: rl_usuario_puesto;
  getRl_usuario_puesto!: Sequelize.BelongsToGetAssociationMixin<rl_usuario_puesto>;
  setRl_usuario_puesto!: Sequelize.BelongsToSetAssociationMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  createRl_usuario_puesto!: Sequelize.BelongsToCreateAssociationMixin<rl_usuario_puesto>;

  static initModel(sequelize: Sequelize.Sequelize): typeof rl_correspondencia_usuario_estado {
    return rl_correspondencia_usuario_estado.init({
    id_correspondencia_usuario: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    dt_correspondencia_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'dt_correspondencia',
        key: 'id_correspondencia'
      }
    },
    rl_usuario_puesto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'rl_usuario_puesto',
        key: 'id_usuario_puesto'
      }
    },
    ct_correspondencia_estado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ct_correspondencia_estado',
        key: 'id_correspondencia_estado'
      }
    },
    observaciones: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    ct_usuarios_in: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ct_usuario',
        key: 'id_usuario'
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'rl_correspondencia_usuario_estado',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_correspondencia_usuario" },
        ]
      },
      {
        name: "FK_rl_correspondencia_usuario_estado_dt_correspondencia",
        using: "BTREE",
        fields: [
          { name: "dt_correspondencia_id" },
        ]
      },
      {
        name: "FK_rl_correspondencia_usuario_estado_rl_usuario_puesto",
        using: "BTREE",
        fields: [
          { name: "rl_usuario_puesto_id" },
        ]
      },
      {
        name: "FK_rl_correspondencia_usuario_estado_ct_correspondencia_estado",
        using: "BTREE",
        fields: [
          { name: "ct_correspondencia_estado" },
        ]
      },
      {
        name: "FK_rl_correspondencia_usuario_estado_ct_usuario",
        using: "BTREE",
        fields: [
          { name: "ct_usuarios_in" },
        ]
      },
    ]
  });
  }
}
