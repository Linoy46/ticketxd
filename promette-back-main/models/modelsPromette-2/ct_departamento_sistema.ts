import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_area, ct_areaId } from './ct_area';
import type { ct_direccion_sistema, ct_direccion_sistemaId } from './ct_direccion_sistema';
import type { ct_usuario, ct_usuarioId } from './ct_usuario';

export interface ct_departamento_sistemaAttributes {
  id_departamento: number;
  nombre_departamento?: string;
  ct_direccion_id?: number;
  estado: number;
  ct_usuario_in: number;
  ct_usuario_at?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ct_departamento_sistemaPk = "id_departamento";
export type ct_departamento_sistemaId = ct_departamento_sistema[ct_departamento_sistemaPk];
export type ct_departamento_sistemaOptionalAttributes = "id_departamento" | "nombre_departamento" | "ct_direccion_id" | "estado" | "ct_usuario_at";
export type ct_departamento_sistemaCreationAttributes = Optional<ct_departamento_sistemaAttributes, ct_departamento_sistemaOptionalAttributes>;

export class ct_departamento_sistema extends Model<ct_departamento_sistemaAttributes, ct_departamento_sistemaCreationAttributes> implements ct_departamento_sistemaAttributes {
  id_departamento!: number;
  nombre_departamento?: string;
  ct_direccion_id?: number;
  estado!: number;
  ct_usuario_in!: number;
  ct_usuario_at?: number;
  createdAt!: Date;
  updatedAt!: Date;

  // ct_departamento_sistema hasMany ct_area via ct_departamento_id
  ct_areas!: ct_area[];
  getCt_areas!: Sequelize.HasManyGetAssociationsMixin<ct_area>;
  setCt_areas!: Sequelize.HasManySetAssociationsMixin<ct_area, ct_areaId>;
  addCt_area!: Sequelize.HasManyAddAssociationMixin<ct_area, ct_areaId>;
  addCt_areas!: Sequelize.HasManyAddAssociationsMixin<ct_area, ct_areaId>;
  createCt_area!: Sequelize.HasManyCreateAssociationMixin<ct_area>;
  removeCt_area!: Sequelize.HasManyRemoveAssociationMixin<ct_area, ct_areaId>;
  removeCt_areas!: Sequelize.HasManyRemoveAssociationsMixin<ct_area, ct_areaId>;
  hasCt_area!: Sequelize.HasManyHasAssociationMixin<ct_area, ct_areaId>;
  hasCt_areas!: Sequelize.HasManyHasAssociationsMixin<ct_area, ct_areaId>;
  countCt_areas!: Sequelize.HasManyCountAssociationsMixin;
  // ct_departamento_sistema belongsTo ct_direccion_sistema via ct_direccion_id
  ct_direccion!: ct_direccion_sistema;
  getCt_direccion!: Sequelize.BelongsToGetAssociationMixin<ct_direccion_sistema>;
  setCt_direccion!: Sequelize.BelongsToSetAssociationMixin<ct_direccion_sistema, ct_direccion_sistemaId>;
  createCt_direccion!: Sequelize.BelongsToCreateAssociationMixin<ct_direccion_sistema>;
  // ct_departamento_sistema belongsTo ct_usuario via ct_usuario_in
  ct_usuario_in_ct_usuario!: ct_usuario;
  getCt_usuario_in_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_in_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_in_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // ct_departamento_sistema belongsTo ct_usuario via ct_usuario_at
  ct_usuario_at_ct_usuario!: ct_usuario;
  getCt_usuario_at_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_at_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_at_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;

  static initModel(sequelize: Sequelize.Sequelize): typeof ct_departamento_sistema {
    return ct_departamento_sistema.init({
    id_departamento: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre_departamento: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    ct_direccion_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 85,
      references: {
        model: 'ct_direccion_sistema',
        key: 'id_direccion'
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
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'ct_departamento_sistema',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_departamento" },
        ]
      },
      {
        name: "fk_ct_departamento_sistema_direccion",
        using: "BTREE",
        fields: [
          { name: "ct_direccion_id" },
        ]
      },
      {
        name: "fk_ct_departamento_sistema_creado_por",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_in" },
        ]
      },
      {
        name: "fk_ct_departamento_sistema_actualizado_por",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_at" },
        ]
      },
    ]
  });
  }
}
