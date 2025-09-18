import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_departamento_sistema, ct_departamento_sistemaId } from './ct_departamento_sistema';
import type { ct_usuario, ct_usuarioId } from './ct_usuario';

export interface ct_areaAttributes {
  id_area: number;
  indice?: string;
  nombre_area: string;
  ct_area_id?: number;
  ct_departamento_id: number;
  estado: number;
  ct_usuario_in: number;
  ct_usuario_at?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ct_areaPk = "id_area";
export type ct_areaId = ct_area[ct_areaPk];
export type ct_areaOptionalAttributes = "id_area" | "indice" | "ct_area_id" | "ct_departamento_id" | "estado" | "ct_usuario_at";
export type ct_areaCreationAttributes = Optional<ct_areaAttributes, ct_areaOptionalAttributes>;

export class ct_area extends Model<ct_areaAttributes, ct_areaCreationAttributes> implements ct_areaAttributes {
  id_area!: number;
  indice?: string;
  nombre_area!: string;
  ct_area_id?: number;
  ct_departamento_id!: number;
  estado!: number;
  ct_usuario_in!: number;
  ct_usuario_at?: number;
  createdAt!: Date;
  updatedAt!: Date;

  // ct_area belongsTo ct_area via ct_area_id
  ct_area!: ct_area;
  getCt_area!: Sequelize.BelongsToGetAssociationMixin<ct_area>;
  setCt_area!: Sequelize.BelongsToSetAssociationMixin<ct_area, ct_areaId>;
  createCt_area!: Sequelize.BelongsToCreateAssociationMixin<ct_area>;
  // ct_area belongsTo ct_departamento_sistema via ct_departamento_id
  ct_departamento!: ct_departamento_sistema;
  getCt_departamento!: Sequelize.BelongsToGetAssociationMixin<ct_departamento_sistema>;
  setCt_departamento!: Sequelize.BelongsToSetAssociationMixin<ct_departamento_sistema, ct_departamento_sistemaId>;
  createCt_departamento!: Sequelize.BelongsToCreateAssociationMixin<ct_departamento_sistema>;
  // ct_area belongsTo ct_usuario via ct_usuario_in
  ct_usuario_in_ct_usuario!: ct_usuario;
  getCt_usuario_in_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_in_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_in_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // ct_area belongsTo ct_usuario via ct_usuario_at
  ct_usuario_at_ct_usuario!: ct_usuario;
  getCt_usuario_at_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_at_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_at_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;

  static initModel(sequelize: Sequelize.Sequelize): typeof ct_area {
    return ct_area.init({
    id_area: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    indice: {
      type: DataTypes.STRING(25),
      allowNull: true
    },
    nombre_area: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    ct_area_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      references: {
        model: 'ct_area',
        key: 'id_area'
      }
    },
    ct_departamento_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: 'ct_departamento_sistema',
        key: 'id_departamento'
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
    tableName: 'ct_area',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_area" },
        ]
      },
      {
        name: "fk_ct_area_superior",
        using: "BTREE",
        fields: [
          { name: "ct_area_id" },
        ]
      },
      {
        name: "fk_ct_area_departamento",
        using: "BTREE",
        fields: [
          { name: "ct_departamento_id" },
        ]
      },
      {
        name: "fk_ct_area_creado_por",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_in" },
        ]
      },
      {
        name: "fk_ct_area_actualizado_por",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_at" },
        ]
      },
    ]
  });
  }
}
