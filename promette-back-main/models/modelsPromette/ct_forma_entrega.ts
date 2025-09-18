import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { dt_correspondencia, dt_correspondenciaId } from './dt_correspondencia';

export interface ct_forma_entregaAttributes {
  id_forma_entrega: number;
  nombre_entrega: string;
  estado: number;
}

export type ct_forma_entregaPk = "id_forma_entrega";
export type ct_forma_entregaId = ct_forma_entrega[ct_forma_entregaPk];
export type ct_forma_entregaOptionalAttributes = "id_forma_entrega" | "nombre_entrega" | "estado";
export type ct_forma_entregaCreationAttributes = Optional<ct_forma_entregaAttributes, ct_forma_entregaOptionalAttributes>;

export class ct_forma_entrega extends Model<ct_forma_entregaAttributes, ct_forma_entregaCreationAttributes> implements ct_forma_entregaAttributes {
  id_forma_entrega!: number;
  nombre_entrega!: string;
  estado!: number;

  // ct_forma_entrega hasMany dt_correspondencia via ct_forma_entrega_id
  dt_correspondencia!: dt_correspondencia[];
  getDt_correspondencia!: Sequelize.HasManyGetAssociationsMixin<dt_correspondencia>;
  setDt_correspondencia!: Sequelize.HasManySetAssociationsMixin<dt_correspondencia, dt_correspondenciaId>;
  addDt_correspondencium!: Sequelize.HasManyAddAssociationMixin<dt_correspondencia, dt_correspondenciaId>;
  addDt_correspondencia!: Sequelize.HasManyAddAssociationsMixin<dt_correspondencia, dt_correspondenciaId>;
  createDt_correspondencium!: Sequelize.HasManyCreateAssociationMixin<dt_correspondencia>;
  removeDt_correspondencium!: Sequelize.HasManyRemoveAssociationMixin<dt_correspondencia, dt_correspondenciaId>;
  removeDt_correspondencia!: Sequelize.HasManyRemoveAssociationsMixin<dt_correspondencia, dt_correspondenciaId>;
  hasDt_correspondencium!: Sequelize.HasManyHasAssociationMixin<dt_correspondencia, dt_correspondenciaId>;
  hasDt_correspondencia!: Sequelize.HasManyHasAssociationsMixin<dt_correspondencia, dt_correspondenciaId>;
  countDt_correspondencia!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof ct_forma_entrega {
    return ct_forma_entrega.init({
    id_forma_entrega: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre_entrega: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "0"
    },
    estado: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'ct_forma_entrega',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_forma_entrega" },
        ]
      },
    ]
  });
  }
}
