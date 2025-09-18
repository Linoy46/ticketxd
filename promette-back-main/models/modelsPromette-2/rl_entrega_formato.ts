import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_usuario, ct_usuarioId } from './ct_usuario';
import type { dt_consumible_entrega, dt_consumible_entregaId } from './dt_consumible_entrega';

export interface rl_entrega_formatoAttributes {
  id_formato: number;
  folio_formato: string;
  mes_cantidad?: string;
  persona_recibe?: string;
  ct_usuario_id: number;
  createdAt: Date;
  updatedAt: Date;
}

export type rl_entrega_formatoPk = "id_formato";
export type rl_entrega_formatoId = rl_entrega_formato[rl_entrega_formatoPk];
export type rl_entrega_formatoOptionalAttributes = "id_formato" | "mes_cantidad" | "persona_recibe" | "createdAt" | "updatedAt";
export type rl_entrega_formatoCreationAttributes = Optional<rl_entrega_formatoAttributes, rl_entrega_formatoOptionalAttributes>;

export class rl_entrega_formato extends Model<rl_entrega_formatoAttributes, rl_entrega_formatoCreationAttributes> implements rl_entrega_formatoAttributes {
  id_formato!: number;
  folio_formato!: string;
  mes_cantidad?: string;
  persona_recibe?: string;
  ct_usuario_id!: number;
  createdAt!: Date;
  updatedAt!: Date;

  // rl_entrega_formato belongsTo ct_usuario via ct_usuario_id
  ct_usuario!: ct_usuario;
  getCt_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // rl_entrega_formato hasMany dt_consumible_entrega via folio_formato
  dt_consumible_entregas!: dt_consumible_entrega[];
  getDt_consumible_entregas!: Sequelize.HasManyGetAssociationsMixin<dt_consumible_entrega>;
  setDt_consumible_entregas!: Sequelize.HasManySetAssociationsMixin<dt_consumible_entrega, dt_consumible_entregaId>;
  addDt_consumible_entrega!: Sequelize.HasManyAddAssociationMixin<dt_consumible_entrega, dt_consumible_entregaId>;
  addDt_consumible_entregas!: Sequelize.HasManyAddAssociationsMixin<dt_consumible_entrega, dt_consumible_entregaId>;
  createDt_consumible_entrega!: Sequelize.HasManyCreateAssociationMixin<dt_consumible_entrega>;
  removeDt_consumible_entrega!: Sequelize.HasManyRemoveAssociationMixin<dt_consumible_entrega, dt_consumible_entregaId>;
  removeDt_consumible_entregas!: Sequelize.HasManyRemoveAssociationsMixin<dt_consumible_entrega, dt_consumible_entregaId>;
  hasDt_consumible_entrega!: Sequelize.HasManyHasAssociationMixin<dt_consumible_entrega, dt_consumible_entregaId>;
  hasDt_consumible_entregas!: Sequelize.HasManyHasAssociationsMixin<dt_consumible_entrega, dt_consumible_entregaId>;
  countDt_consumible_entregas!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof rl_entrega_formato {
    return rl_entrega_formato.init({
    id_formato: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    folio_formato: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "Folio común para agrupar múltiples entregas",
      unique: "folio_formato_UNIQUE"
    },
    mes_cantidad: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Mes y cantidad para el formato"
    },
    persona_recibe: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Nombre de la persona que recibe los artículos"
    },
    ct_usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Usuario que generó el formato",
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
    tableName: 'rl_entrega_formato',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_formato" },
        ]
      },
      {
        name: "folio_formato_UNIQUE",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "folio_formato" },
        ]
      },
      {
        name: "fk_rl_entrega_formato_ct_usuario_idx",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_id" },
        ]
      },
    ]
  });
  }
}
