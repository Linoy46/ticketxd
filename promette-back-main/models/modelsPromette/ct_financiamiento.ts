import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { dt_techo_presupuesto, dt_techo_presupuestoId } from './dt_techo_presupuesto';

export interface ct_financiamientoAttributes {
  id_financiamiento: number;
  nombre_financiamiento: string;
  estado: number;
}

export type ct_financiamientoPk = "id_financiamiento";
export type ct_financiamientoId = ct_financiamiento[ct_financiamientoPk];
export type ct_financiamientoOptionalAttributes = "id_financiamiento" | "nombre_financiamiento" | "estado";
export type ct_financiamientoCreationAttributes = Optional<ct_financiamientoAttributes, ct_financiamientoOptionalAttributes>;

export class ct_financiamiento extends Model<ct_financiamientoAttributes, ct_financiamientoCreationAttributes> implements ct_financiamientoAttributes {
  id_financiamiento!: number;
  nombre_financiamiento!: string;
  estado!: number;

  // ct_financiamiento hasMany dt_techo_presupuesto via ct_financiamiento_id
  dt_techo_presupuestos!: dt_techo_presupuesto[];
  getDt_techo_presupuestos!: Sequelize.HasManyGetAssociationsMixin<dt_techo_presupuesto>;
  setDt_techo_presupuestos!: Sequelize.HasManySetAssociationsMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  addDt_techo_presupuesto!: Sequelize.HasManyAddAssociationMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  addDt_techo_presupuestos!: Sequelize.HasManyAddAssociationsMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  createDt_techo_presupuesto!: Sequelize.HasManyCreateAssociationMixin<dt_techo_presupuesto>;
  removeDt_techo_presupuesto!: Sequelize.HasManyRemoveAssociationMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  removeDt_techo_presupuestos!: Sequelize.HasManyRemoveAssociationsMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  hasDt_techo_presupuesto!: Sequelize.HasManyHasAssociationMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  hasDt_techo_presupuestos!: Sequelize.HasManyHasAssociationsMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  countDt_techo_presupuestos!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof ct_financiamiento {
    return ct_financiamiento.init({
    id_financiamiento: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre_financiamiento: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "0"
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'ct_financiamiento',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_financiamiento" },
        ]
      },
    ]
  });
  }
}
