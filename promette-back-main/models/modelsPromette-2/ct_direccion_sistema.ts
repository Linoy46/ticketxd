import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_departamento_sistema, ct_departamento_sistemaId } from './ct_departamento_sistema';
import type { ct_usuario, ct_usuarioId } from './ct_usuario';

export interface ct_direccion_sistemaAttributes {
  id_direccion: number;
  nombre_direccion?: string;
  ct_dependencia_id?: number;
  estado: number;
  ct_usuario_in: number;
  ct_usuario_at?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ct_direccion_sistemaPk = "id_direccion";
export type ct_direccion_sistemaId = ct_direccion_sistema[ct_direccion_sistemaPk];
export type ct_direccion_sistemaOptionalAttributes = "id_direccion" | "nombre_direccion" | "ct_dependencia_id" | "estado" | "ct_usuario_at";
export type ct_direccion_sistemaCreationAttributes = Optional<ct_direccion_sistemaAttributes, ct_direccion_sistemaOptionalAttributes>;

export class ct_direccion_sistema extends Model<ct_direccion_sistemaAttributes, ct_direccion_sistemaCreationAttributes> implements ct_direccion_sistemaAttributes {
  id_direccion!: number;
  nombre_direccion?: string;
  ct_dependencia_id?: number;
  estado!: number;
  ct_usuario_in!: number;
  ct_usuario_at?: number;
  createdAt!: Date;
  updatedAt!: Date;

  // ct_direccion_sistema hasMany ct_departamento_sistema via ct_direccion_id
  ct_departamento_sistemas!: ct_departamento_sistema[];
  getCt_departamento_sistemas!: Sequelize.HasManyGetAssociationsMixin<ct_departamento_sistema>;
  setCt_departamento_sistemas!: Sequelize.HasManySetAssociationsMixin<ct_departamento_sistema, ct_departamento_sistemaId>;
  addCt_departamento_sistema!: Sequelize.HasManyAddAssociationMixin<ct_departamento_sistema, ct_departamento_sistemaId>;
  addCt_departamento_sistemas!: Sequelize.HasManyAddAssociationsMixin<ct_departamento_sistema, ct_departamento_sistemaId>;
  createCt_departamento_sistema!: Sequelize.HasManyCreateAssociationMixin<ct_departamento_sistema>;
  removeCt_departamento_sistema!: Sequelize.HasManyRemoveAssociationMixin<ct_departamento_sistema, ct_departamento_sistemaId>;
  removeCt_departamento_sistemas!: Sequelize.HasManyRemoveAssociationsMixin<ct_departamento_sistema, ct_departamento_sistemaId>;
  hasCt_departamento_sistema!: Sequelize.HasManyHasAssociationMixin<ct_departamento_sistema, ct_departamento_sistemaId>;
  hasCt_departamento_sistemas!: Sequelize.HasManyHasAssociationsMixin<ct_departamento_sistema, ct_departamento_sistemaId>;
  countCt_departamento_sistemas!: Sequelize.HasManyCountAssociationsMixin;
  // ct_direccion_sistema belongsTo ct_usuario via ct_usuario_in
  ct_usuario_in_ct_usuario!: ct_usuario;
  getCt_usuario_in_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_in_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_in_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // ct_direccion_sistema belongsTo ct_usuario via ct_usuario_at
  ct_usuario_at_ct_usuario!: ct_usuario;
  getCt_usuario_at_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_at_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_at_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;

  static initModel(sequelize: Sequelize.Sequelize): typeof ct_direccion_sistema {
    return ct_direccion_sistema.init({
    id_direccion: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre_direccion: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    ct_dependencia_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
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
    tableName: 'ct_direccion_sistema',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_direccion" },
        ]
      },
      {
        name: "fk_ct_direccion_sistema_creado_por",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_in" },
        ]
      },
      {
        name: "fk_ct_direccion_sistema_actualizado_por",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_at" },
        ]
      },
    ]
  });
  }
}
