import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_producto_consumible, ct_producto_consumibleId } from './ct_producto_consumible';
import type { ct_usuario, ct_usuarioId } from './ct_usuario';
import type { dt_techo_presupuesto, dt_techo_presupuestoId } from './dt_techo_presupuesto';
import type { rl_area_financiero, rl_area_financieroId } from './rl_area_financiero';

export interface rl_producto_requisicionAttributes {
  id_producto_requisicion: number;
  ct_area_id: number;
  dt_techo_id: number;
  ct_productos_id: number;
  cantidad: number;
  mes: string;
  total: number;
  ct_usuarios_in: number;
  ct_usuarios_at?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type rl_producto_requisicionPk = "id_producto_requisicion";
export type rl_producto_requisicionId = rl_producto_requisicion[rl_producto_requisicionPk];
export type rl_producto_requisicionOptionalAttributes = "id_producto_requisicion" | "ct_area_id" | "dt_techo_id" | "ct_productos_id" | "cantidad" | "mes" | "ct_usuarios_in" | "ct_usuarios_at" | "createdAt" | "updatedAt";
export type rl_producto_requisicionCreationAttributes = Optional<rl_producto_requisicionAttributes, rl_producto_requisicionOptionalAttributes>;

export class rl_producto_requisicion extends Model<rl_producto_requisicionAttributes, rl_producto_requisicionCreationAttributes> implements rl_producto_requisicionAttributes {
  id_producto_requisicion!: number;
  ct_area_id!: number;
  dt_techo_id!: number;
  ct_productos_id!: number;
  cantidad!: number;
  mes!: string;
  total!: number;
  ct_usuarios_in!: number;
  ct_usuarios_at?: number;
  createdAt!: Date;
  updatedAt!: Date;

  // rl_producto_requisicion belongsTo ct_producto_consumible via ct_productos_id
  ct_producto!: ct_producto_consumible;
  getCt_producto!: Sequelize.BelongsToGetAssociationMixin<ct_producto_consumible>;
  setCt_producto!: Sequelize.BelongsToSetAssociationMixin<ct_producto_consumible, ct_producto_consumibleId>;
  createCt_producto!: Sequelize.BelongsToCreateAssociationMixin<ct_producto_consumible>;
  // rl_producto_requisicion belongsTo ct_usuario via ct_usuarios_in
  ct_usuarios_in_ct_usuario!: ct_usuario;
  getCt_usuarios_in_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuarios_in_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuarios_in_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // rl_producto_requisicion belongsTo dt_techo_presupuesto via dt_techo_id
  dt_techo!: dt_techo_presupuesto;
  getDt_techo!: Sequelize.BelongsToGetAssociationMixin<dt_techo_presupuesto>;
  setDt_techo!: Sequelize.BelongsToSetAssociationMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  createDt_techo!: Sequelize.BelongsToCreateAssociationMixin<dt_techo_presupuesto>;
  // rl_producto_requisicion belongsTo rl_area_financiero via ct_area_id
  ct_area!: rl_area_financiero;
  getCt_area!: Sequelize.BelongsToGetAssociationMixin<rl_area_financiero>;
  setCt_area!: Sequelize.BelongsToSetAssociationMixin<rl_area_financiero, rl_area_financieroId>;
  createCt_area!: Sequelize.BelongsToCreateAssociationMixin<rl_area_financiero>;

  static initModel(sequelize: Sequelize.Sequelize): typeof rl_producto_requisicion {
    return rl_producto_requisicion.init({
    id_producto_requisicion: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ct_area_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: 'rl_area_financiero',
        key: 'id_area_fin'
      }
    },
    dt_techo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: 'dt_techo_presupuesto',
        key: 'id_techo'
      }
    },
    ct_productos_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: 'ct_producto_consumible',
        key: 'id_producto'
      }
    },
    cantidad: {
      type: DataTypes.DECIMAL(10,3),
      allowNull: false,
      defaultValue: 0.000
    },
    mes: {
      type: DataTypes.STRING(2),
      allowNull: false,
      defaultValue: "0"
    },
    total: {
      type: DataTypes.DECIMAL(15,3),
      allowNull: false
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
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'rl_producto_requisicion',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_producto_requisicion" },
        ]
      },
      {
        name: "FK__ct_producto_consumible",
        using: "BTREE",
        fields: [
          { name: "ct_productos_id" },
        ]
      },
      {
        name: "FK__ct_usuario",
        using: "BTREE",
        fields: [
          { name: "ct_usuarios_in" },
        ]
      },
      {
        name: "FK_rl_producto_requisicion_dt_techo_presupuesto",
        using: "BTREE",
        fields: [
          { name: "dt_techo_id" },
        ]
      },
      {
        name: "FK__ct_area_idx",
        using: "BTREE",
        fields: [
          { name: "ct_area_id" },
        ]
      },
    ]
  });
  }
}
