import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_usuario, ct_usuarioId } from './ct_usuario';
import type { rl_usuario_puesto, rl_usuario_puestoId } from './rl_usuario_puesto';

export interface ct_sindicatoAttributes {
  id_sindicato: number;
  nombre_sindicato?: string;
  estado: number;
  ct_usuario_in: number;
  ct_usuario_at?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ct_sindicatoPk = "id_sindicato";
export type ct_sindicatoId = ct_sindicato[ct_sindicatoPk];
export type ct_sindicatoOptionalAttributes = "id_sindicato" | "nombre_sindicato" | "estado" | "ct_usuario_at" | "createdAt" | "updatedAt";
export type ct_sindicatoCreationAttributes = Optional<ct_sindicatoAttributes, ct_sindicatoOptionalAttributes>;

export class ct_sindicato extends Model<ct_sindicatoAttributes, ct_sindicatoCreationAttributes> implements ct_sindicatoAttributes {
  id_sindicato!: number;
  nombre_sindicato?: string;
  estado!: number;
  ct_usuario_in!: number;
  ct_usuario_at?: number;
  createdAt!: Date;
  updatedAt!: Date;

  // ct_sindicato hasMany rl_usuario_puesto via ct_sindicato_id
  rl_usuario_puestos!: rl_usuario_puesto[];
  getRl_usuario_puestos!: Sequelize.HasManyGetAssociationsMixin<rl_usuario_puesto>;
  setRl_usuario_puestos!: Sequelize.HasManySetAssociationsMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  addRl_usuario_puesto!: Sequelize.HasManyAddAssociationMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  addRl_usuario_puestos!: Sequelize.HasManyAddAssociationsMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  createRl_usuario_puesto!: Sequelize.HasManyCreateAssociationMixin<rl_usuario_puesto>;
  removeRl_usuario_puesto!: Sequelize.HasManyRemoveAssociationMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  removeRl_usuario_puestos!: Sequelize.HasManyRemoveAssociationsMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  hasRl_usuario_puesto!: Sequelize.HasManyHasAssociationMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  hasRl_usuario_puestos!: Sequelize.HasManyHasAssociationsMixin<rl_usuario_puesto, rl_usuario_puestoId>;
  countRl_usuario_puestos!: Sequelize.HasManyCountAssociationsMixin;
  // ct_sindicato belongsTo ct_usuario via ct_usuario_in
  ct_usuario_in_ct_usuario!: ct_usuario;
  getCt_usuario_in_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_in_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_in_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // ct_sindicato belongsTo ct_usuario via ct_usuario_at
  ct_usuario_at_ct_usuario!: ct_usuario;
  getCt_usuario_at_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_at_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_at_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;

  static initModel(sequelize: Sequelize.Sequelize): typeof ct_sindicato {
    return ct_sindicato.init({
    id_sindicato: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre_sindicato: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    ct_usuario_in: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    tableName: 'ct_sindicato',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_sindicato" },
        ]
      },
      {
        name: "fk_ct_sindicato_creado_por",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_in" },
        ]
      },
      {
        name: "fk_ct_sindicato_actualizado_por",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_at" },
        ]
      },
    ]
  });
  }
}
