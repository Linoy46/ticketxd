import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { dt_techo_presupuesto, dt_techo_presupuestoId } from './dt_techo_presupuesto';

export interface dt_proyecto_anualAttributes {
  id_proyecto_anual: number;
  'año': number;
  dt_techo_id: number;
  monto_asignado: number;
  monto_utilizado: number;
  monto_disponible: number;
  descripcion?: string;
  estado: number;
  createdAt: Date;
  updatedAt: Date;
}

export type dt_proyecto_anualPk = "id_proyecto_anual";
export type dt_proyecto_anualId = dt_proyecto_anual[dt_proyecto_anualPk];
export type dt_proyecto_anualOptionalAttributes = "id_proyecto_anual" | "monto_asignado" | "monto_utilizado" | "monto_disponible" | "descripcion" | "estado" | "createdAt" | "updatedAt";
export type dt_proyecto_anualCreationAttributes = Optional<dt_proyecto_anualAttributes, dt_proyecto_anualOptionalAttributes>;

export class dt_proyecto_anual extends Model<dt_proyecto_anualAttributes, dt_proyecto_anualCreationAttributes> implements dt_proyecto_anualAttributes {
  id_proyecto_anual!: number;
  'año'!: number;
  dt_techo_id!: number;
  monto_asignado!: number;
  monto_utilizado!: number;
  monto_disponible!: number;
  descripcion?: string;
  estado!: number;
  createdAt!: Date;
  updatedAt!: Date;

  // dt_proyecto_anual belongsTo dt_techo_presupuesto via dt_techo_id
  dt_techo!: dt_techo_presupuesto;
  getDt_techo!: Sequelize.BelongsToGetAssociationMixin<dt_techo_presupuesto>;
  setDt_techo!: Sequelize.BelongsToSetAssociationMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  createDt_techo!: Sequelize.BelongsToCreateAssociationMixin<dt_techo_presupuesto>;

  static initModel(sequelize: Sequelize.Sequelize): typeof dt_proyecto_anual {
    return dt_proyecto_anual.init({
    id_proyecto_anual: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    'año': {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Año al que corresponde el proyecto"
    },
    dt_techo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "ID del área asociada a este proyecto",
      references: {
        model: 'dt_techo_presupuesto',
        key: 'id_techo'
      }
    },
    monto_asignado: {
      type: DataTypes.DECIMAL(15,3),
      allowNull: false,
      defaultValue: 0.000,
      comment: "Monto ejercido MAC hasta el momento"
    },
    monto_utilizado: {
      type: DataTypes.DECIMAL(15,3),
      allowNull: false,
      defaultValue: 0.000,
      comment: "Monto ejercido estatal hasta el momento"
    },
    monto_disponible: {
      type: DataTypes.DECIMAL(15,3),
      allowNull: false,
      defaultValue: 0.000,
      comment: "Monto ejercido FONE hasta el momento"
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Descripción o detalles del proyecto anual"
    },
    estado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: "Estado del proyecto (1: activo, 0: inactivo)"
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
    tableName: 'dt_proyecto_anual',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_proyecto_anual" },
        ]
      },
      {
        name: "idx_proyecto_anual_año",
        using: "BTREE",
        fields: [
          { name: "año" },
        ]
      },
      {
        name: "fk_proyecto_anual_techo_presupuestal_idx",
        using: "BTREE",
        fields: [
          { name: "dt_techo_id" },
        ]
      },
    ]
  });
  }
}
