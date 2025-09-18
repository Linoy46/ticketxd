import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_clasificacion_prioridad, ct_clasificacion_prioridadId } from './ct_clasificacion_prioridad';
import type { ct_forma_entrega, ct_forma_entregaId } from './ct_forma_entrega';
import type { ct_usuario, ct_usuarioId } from './ct_usuario';
import type { rl_correspondencia_usuario_estado, rl_correspondencia_usuario_estadoId } from './rl_correspondencia_usuario_estado';

export interface dt_correspondenciaAttributes {
  id_correspondencia: number;
  ct_clasificacion_prioridad_id: number;
  ct_forma_entrega_id: number;
  folio_sistema: string;
  fecha_correspondencia: Date;
  folio_correspondencia: string;
  resumen_correspondencia: string;
  ruta_correspondencia: string;
  ct_usuarios_in: number;
  ct_usuarios_at?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export type dt_correspondenciaPk = "id_correspondencia";
export type dt_correspondenciaId = dt_correspondencia[dt_correspondenciaPk];
export type dt_correspondenciaOptionalAttributes = "id_correspondencia" | "ct_clasificacion_prioridad_id" | "ct_forma_entrega_id" | "folio_sistema" | "folio_correspondencia" | "resumen_correspondencia" | "ruta_correspondencia" | "ct_usuarios_in" | "ct_usuarios_at" | "createdAt" | "updatedAt";
export type dt_correspondenciaCreationAttributes = Optional<dt_correspondenciaAttributes, dt_correspondenciaOptionalAttributes>;

export class dt_correspondencia extends Model<dt_correspondenciaAttributes, dt_correspondenciaCreationAttributes> implements dt_correspondenciaAttributes {
  id_correspondencia!: number;
  ct_clasificacion_prioridad_id!: number;
  ct_forma_entrega_id!: number;
  folio_sistema!: string;
  fecha_correspondencia!: Date;
  folio_correspondencia!: string;
  resumen_correspondencia!: string;
  ruta_correspondencia!: string;
  ct_usuarios_in!: number;
  ct_usuarios_at?: number;
  createdAt!: Date;
  updatedAt?: Date;

  // dt_correspondencia belongsTo ct_clasificacion_prioridad via ct_clasificacion_prioridad_id
  ct_clasificacion_prioridad!: ct_clasificacion_prioridad;
  getCt_clasificacion_prioridad!: Sequelize.BelongsToGetAssociationMixin<ct_clasificacion_prioridad>;
  setCt_clasificacion_prioridad!: Sequelize.BelongsToSetAssociationMixin<ct_clasificacion_prioridad, ct_clasificacion_prioridadId>;
  createCt_clasificacion_prioridad!: Sequelize.BelongsToCreateAssociationMixin<ct_clasificacion_prioridad>;
  // dt_correspondencia belongsTo ct_forma_entrega via ct_forma_entrega_id
  ct_forma_entrega!: ct_forma_entrega;
  getCt_forma_entrega!: Sequelize.BelongsToGetAssociationMixin<ct_forma_entrega>;
  setCt_forma_entrega!: Sequelize.BelongsToSetAssociationMixin<ct_forma_entrega, ct_forma_entregaId>;
  createCt_forma_entrega!: Sequelize.BelongsToCreateAssociationMixin<ct_forma_entrega>;
  // dt_correspondencia belongsTo ct_usuario via ct_usuarios_in
  ct_usuarios_in_ct_usuario!: ct_usuario;
  getCt_usuarios_in_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuarios_in_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuarios_in_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // dt_correspondencia hasMany rl_correspondencia_usuario_estado via dt_correspondencia_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof dt_correspondencia {
    return dt_correspondencia.init({
    id_correspondencia: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ct_clasificacion_prioridad_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: 'ct_clasificacion_prioridad',
        key: 'id_prioridad'
      }
    },
    ct_forma_entrega_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: 'ct_forma_entrega',
        key: 'id_forma_entrega'
      }
    },
    folio_sistema: {
      type: DataTypes.STRING(15),
      allowNull: false,
      defaultValue: "0"
    },
    fecha_correspondencia: {
      type: DataTypes.DATE,
      allowNull: false
    },
    folio_correspondencia: {
      type: DataTypes.STRING(15),
      allowNull: false,
      defaultValue: "0"
    },
    resumen_correspondencia: {
      type: DataTypes.STRING(300),
      allowNull: false,
      defaultValue: "0"
    },
    ruta_correspondencia: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "0"
    },
    ct_usuarios_in: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: 'ct_usuario',
        key: 'id_usuario'
      }
    },
    ct_usuarios_at: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
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
    }
  }, {
    sequelize,
    tableName: 'dt_correspondencia',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_correspondencia" },
        ]
      },
      {
        name: "FK_dt_correspondencia_ct_clasificacion_prioridad",
        using: "BTREE",
        fields: [
          { name: "ct_clasificacion_prioridad_id" },
        ]
      },
      {
        name: "FK_dt_correspondencia_ct_forma_entrega",
        using: "BTREE",
        fields: [
          { name: "ct_forma_entrega_id" },
        ]
      },
      {
        name: "FK_dt_correspondencia_ct_usuario",
        using: "BTREE",
        fields: [
          { name: "ct_usuarios_in" },
        ]
      },
    ]
  });
  }
}
