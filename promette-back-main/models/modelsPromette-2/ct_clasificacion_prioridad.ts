import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { dt_correspondencia, dt_correspondenciaId } from './dt_correspondencia';

export interface ct_clasificacion_prioridadAttributes {
  id_prioridad: number;
  nombre_prioridad: string;
  estado: number;
}

export type ct_clasificacion_prioridadPk = "id_prioridad";
export type ct_clasificacion_prioridadId = ct_clasificacion_prioridad[ct_clasificacion_prioridadPk];
export type ct_clasificacion_prioridadOptionalAttributes = "id_prioridad" | "nombre_prioridad" | "estado";
export type ct_clasificacion_prioridadCreationAttributes = Optional<ct_clasificacion_prioridadAttributes, ct_clasificacion_prioridadOptionalAttributes>;

export class ct_clasificacion_prioridad extends Model<ct_clasificacion_prioridadAttributes, ct_clasificacion_prioridadCreationAttributes> implements ct_clasificacion_prioridadAttributes {
  id_prioridad!: number;
  nombre_prioridad!: string;
  estado!: number;

  // ct_clasificacion_prioridad hasMany dt_correspondencia via ct_clasificacion_prioridad_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof ct_clasificacion_prioridad {
    return ct_clasificacion_prioridad.init({
    id_prioridad: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre_prioridad: {
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
    tableName: 'ct_clasificacion_prioridad',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_prioridad" },
        ]
      },
    ]
  });
  }
}
