import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_puesto, ct_puestoId } from './ct_puesto';
import type { ct_sindicato, ct_sindicatoId } from './ct_sindicato';
import type { ct_usuario, ct_usuarioId } from './ct_usuario';
import type { rl_correspondencia_usuario_estado, rl_correspondencia_usuario_estadoId } from './rl_correspondencia_usuario_estado';

export interface rl_usuario_puestoAttributes {
  id_usuario_puesto: number;
  ct_usuario_id: number;
  ct_puesto_id: number;
  periodo_inicio: Date;
  periodo_final?: Date;
  plaza?: string;
  ct_sindicato_id?: number;
  estado: number;
  ct_usuario_in: number;
  ct_usuario_at?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type rl_usuario_puestoPk = "id_usuario_puesto";
export type rl_usuario_puestoId = rl_usuario_puesto[rl_usuario_puestoPk];
export type rl_usuario_puestoOptionalAttributes = "id_usuario_puesto" | "periodo_inicio" | "periodo_final" | "plaza" | "ct_sindicato_id" | "estado" | "ct_usuario_in" | "ct_usuario_at" | "createdAt" | "updatedAt";
export type rl_usuario_puestoCreationAttributes = Optional<rl_usuario_puestoAttributes, rl_usuario_puestoOptionalAttributes>;

export class rl_usuario_puesto extends Model<rl_usuario_puestoAttributes, rl_usuario_puestoCreationAttributes> implements rl_usuario_puestoAttributes {
  id_usuario_puesto!: number;
  ct_usuario_id!: number;
  ct_puesto_id!: number;
  periodo_inicio!: Date;
  periodo_final?: Date;
  plaza?: string;
  ct_sindicato_id?: number;
  estado!: number;
  ct_usuario_in!: number;
  ct_usuario_at?: number;
  createdAt!: Date;
  updatedAt!: Date;

  // rl_usuario_puesto belongsTo ct_puesto via ct_puesto_id
  ct_puesto!: ct_puesto;
  getCt_puesto!: Sequelize.BelongsToGetAssociationMixin<ct_puesto>;
  setCt_puesto!: Sequelize.BelongsToSetAssociationMixin<ct_puesto, ct_puestoId>;
  createCt_puesto!: Sequelize.BelongsToCreateAssociationMixin<ct_puesto>;
  // rl_usuario_puesto belongsTo ct_sindicato via ct_sindicato_id
  ct_sindicato!: ct_sindicato;
  getCt_sindicato!: Sequelize.BelongsToGetAssociationMixin<ct_sindicato>;
  setCt_sindicato!: Sequelize.BelongsToSetAssociationMixin<ct_sindicato, ct_sindicatoId>;
  createCt_sindicato!: Sequelize.BelongsToCreateAssociationMixin<ct_sindicato>;
  // rl_usuario_puesto belongsTo ct_usuario via ct_usuario_id
  ct_usuario!: ct_usuario;
  getCt_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // rl_usuario_puesto belongsTo ct_usuario via ct_usuario_in
  ct_usuario_in_ct_usuario!: ct_usuario;
  getCt_usuario_in_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_in_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_in_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // rl_usuario_puesto belongsTo ct_usuario via ct_usuario_at
  ct_usuario_at_ct_usuario!: ct_usuario;
  getCt_usuario_at_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_at_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_at_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // rl_usuario_puesto hasMany rl_correspondencia_usuario_estado via rl_usuario_puesto_id
  rl_correspondencia_usuario_estados!: rl_correspondencia_usuario_estado[];
  getRl_correspondencia_usuario_estados!: Sequelize.HasManyGetAssociationsMixin<rl_correspondencia_usuario_estado>;
  setRl_correspondencia_usuario_estados!: Sequelize.HasManySetAssociationsMixin<rl_correspondencia_usuario_estado, rl_correspondencia_usuario_estadoId>;
  addRl_correspondencia_usuario_estado!: Sequelize.HasManyAddAssociationMixin<rl_correspondencia_usuario_estado, rl_correspondencia_usuario_estadoId>;
  addRl_correspondencia_usuario_estados!: Sequelize.HasManyAddAssociationsMixin<rl_correspondencia_usuario_estado, rl_correspondencia_usuario_estadoId>;
  createRl_correspondencia_usuario_estado!: Sequelize.HasManyCreateAssociationMixin<rl_correspondencia_usuario_estado>;
  removeRl_correspondencia_usuario_estado!: Sequelize.HasManyRemoveAssociationMixin<rl_correspondencia_usuario_estado, rl_correspondencia_usuario_estadoId>;
  removeRl_correspondencia_usuario_estados!: Sequelize.HasManyRemoveAssociationsMixin<rl_correspondencia_usuario_estado, rl_correspondencia_usuario_estadoId>;
  hasRl_correspondencia_usuario_estado!: Sequelize.HasManyHasAssociationMixin<rl_correspondencia_usuario_estado, rl_correspondencia_usuario_estadoId>;
  hasRl_correspondencia_usuario_estados!: Sequelize.HasManyHasAssociationsMixin<rl_correspondencia_usuario_estado, rl_correspondencia_usuario_estadoId>;
  countRl_correspondencia_usuario_estados!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof rl_usuario_puesto {
    return rl_usuario_puesto.init({
    id_usuario_puesto: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ct_usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ct_usuario',
        key: 'id_usuario'
      }
    },
    ct_puesto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ct_puesto',
        key: 'id_puesto'
      }
    },
    periodo_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    periodo_final: {
      type: DataTypes.DATE,
      allowNull: true
    },
    plaza: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ct_sindicato_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'ct_sindicato',
        key: 'id_sindicato'
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
    tableName: 'rl_usuario_puesto',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_usuario_puesto" },
        ]
      },
      {
        name: "rl_usuario_puesto_sindicato",
        using: "BTREE",
        fields: [
          { name: "ct_sindicato_id" },
        ]
      },
      {
        name: "fk_rl_usuario_puesto_ct_usuario",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_id" },
        ]
      },
      {
        name: "fk_rl_usuario_puesto_ct_puesto",
        using: "BTREE",
        fields: [
          { name: "ct_puesto_id" },
        ]
      },
      {
        name: "fk_rl_usuario_puesto_creado_por",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_in" },
        ]
      },
      {
        name: "fk_rl_usuario_puesto_actualizado_por",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_at" },
        ]
      },
    ]
  });
  }
}
