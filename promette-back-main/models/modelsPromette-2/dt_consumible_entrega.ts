import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_unidad_medida, ct_unidad_medidaId } from './ct_unidad_medida';
import type { ct_usuario, ct_usuarioId } from './ct_usuario';
import type { dt_consumible_inventario, dt_consumible_inventarioId } from './dt_consumible_inventario';
import type { rl_entrega_formato, rl_entrega_formatoId } from './rl_entrega_formato';

export interface dt_consumible_entregaAttributes {
  id_entrega: number;
  folio: string;
  ct_area_id: number;
  dt_inventario_id: number;
  ct_unidad_id: number;
  cantidad: number;
  ct_usuario_id: number;
  observaciones: string;
  createdAt: Date;
  updatedAt: Date;
  folio_formato?: string;
}

export type dt_consumible_entregaPk = "id_entrega";
export type dt_consumible_entregaId = dt_consumible_entrega[dt_consumible_entregaPk];
export type dt_consumible_entregaOptionalAttributes = "id_entrega" | "observaciones" | "createdAt" | "updatedAt" | "folio_formato";
export type dt_consumible_entregaCreationAttributes = Optional<dt_consumible_entregaAttributes, dt_consumible_entregaOptionalAttributes>;

export class dt_consumible_entrega extends Model<dt_consumible_entregaAttributes, dt_consumible_entregaCreationAttributes> implements dt_consumible_entregaAttributes {
  id_entrega!: number;
  folio!: string;
  ct_area_id!: number;
  dt_inventario_id!: number;
  ct_unidad_id!: number;
  cantidad!: number;
  ct_usuario_id!: number;
  observaciones!: string;
  createdAt!: Date;
  updatedAt!: Date;
  folio_formato?: string;

  // dt_consumible_entrega belongsTo ct_unidad_medida via ct_unidad_id
  ct_unidad!: ct_unidad_medida;
  getCt_unidad!: Sequelize.BelongsToGetAssociationMixin<ct_unidad_medida>;
  setCt_unidad!: Sequelize.BelongsToSetAssociationMixin<ct_unidad_medida, ct_unidad_medidaId>;
  createCt_unidad!: Sequelize.BelongsToCreateAssociationMixin<ct_unidad_medida>;
  // dt_consumible_entrega belongsTo ct_usuario via ct_usuario_id
  ct_usuario!: ct_usuario;
  getCt_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // dt_consumible_entrega belongsTo dt_consumible_inventario via dt_inventario_id
  dt_inventario!: dt_consumible_inventario;
  getDt_inventario!: Sequelize.BelongsToGetAssociationMixin<dt_consumible_inventario>;
  setDt_inventario!: Sequelize.BelongsToSetAssociationMixin<dt_consumible_inventario, dt_consumible_inventarioId>;
  createDt_inventario!: Sequelize.BelongsToCreateAssociationMixin<dt_consumible_inventario>;
  // dt_consumible_entrega belongsTo rl_entrega_formato via folio_formato
  folio_formato_rl_entrega_formato!: rl_entrega_formato;
  getFolio_formato_rl_entrega_formato!: Sequelize.BelongsToGetAssociationMixin<rl_entrega_formato>;
  setFolio_formato_rl_entrega_formato!: Sequelize.BelongsToSetAssociationMixin<rl_entrega_formato, rl_entrega_formatoId>;
  createFolio_formato_rl_entrega_formato!: Sequelize.BelongsToCreateAssociationMixin<rl_entrega_formato>;

  static initModel(sequelize: Sequelize.Sequelize): typeof dt_consumible_entrega {
    return dt_consumible_entrega.init({
    id_entrega: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    folio: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    ct_area_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    dt_inventario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'dt_consumible_inventario',
        key: 'id_inventario'
      }
    },
    ct_unidad_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ct_unidad_medida',
        key: 'id_unidad'
      }
    },
    cantidad: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    ct_usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ct_usuario',
        key: 'id_usuario'
      }
    },
    observaciones: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
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
    },
    folio_formato: {
      type: DataTypes.STRING(20),
      allowNull: true,
      references: {
        model: 'rl_entrega_formato',
        key: 'folio_formato'
      }
    }
  }, {
    sequelize,
    tableName: 'dt_consumible_entrega',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_entrega" },
        ]
      },
      {
        name: "dt_inventario_id",
        using: "BTREE",
        fields: [
          { name: "dt_inventario_id" },
        ]
      },
      {
        name: "ct_unidad_id",
        using: "BTREE",
        fields: [
          { name: "ct_unidad_id" },
        ]
      },
      {
        name: "fk_dt_consumible_entrega_formato_idx",
        using: "BTREE",
        fields: [
          { name: "folio_formato" },
        ]
      },
      {
        name: "ct_area_id",
        using: "BTREE",
        fields: [
          { name: "ct_area_id" },
        ]
      },
      {
        name: "ct_usuario_id",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_id" },
        ]
      },
    ]
  });
  }
}
