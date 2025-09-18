import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_grado_academico, ct_grado_academicoId } from './ct_grado_academico';
import type { ct_usuario, ct_usuarioId } from './ct_usuario';

export interface dt_dictamen_escalafonAttributes {
  id_dictamen_escalafon: number;
  folio_dictamen?: string;
  dt_informacion_rupeet_id?: number;
  ct_grado_academico_id?: number;
  dt_rupeet_documento_id?: number;
  puntaje_cursos?: number;
  puntaje_antiguedad?: number;
  total_puntaje_escalafon?: number;
  estado: number;
  ct_usuario_in?: number;
  ct_usuario_at?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type dt_dictamen_escalafonPk = "id_dictamen_escalafon";
export type dt_dictamen_escalafonId = dt_dictamen_escalafon[dt_dictamen_escalafonPk];
export type dt_dictamen_escalafonOptionalAttributes = "id_dictamen_escalafon" | "folio_dictamen" | "dt_informacion_rupeet_id" | "ct_grado_academico_id" | "dt_rupeet_documento_id" | "puntaje_cursos" | "puntaje_antiguedad" | "total_puntaje_escalafon" | "estado" | "ct_usuario_in" | "ct_usuario_at" | "createdAt" | "updatedAt";
export type dt_dictamen_escalafonCreationAttributes = Optional<dt_dictamen_escalafonAttributes, dt_dictamen_escalafonOptionalAttributes>;

export class dt_dictamen_escalafon extends Model<dt_dictamen_escalafonAttributes, dt_dictamen_escalafonCreationAttributes> implements dt_dictamen_escalafonAttributes {
  id_dictamen_escalafon!: number;
  folio_dictamen?: string;
  dt_informacion_rupeet_id?: number;
  ct_grado_academico_id?: number;
  dt_rupeet_documento_id?: number;
  puntaje_cursos?: number;
  puntaje_antiguedad?: number;
  total_puntaje_escalafon?: number;
  estado!: number;
  ct_usuario_in?: number;
  ct_usuario_at?: number;
  createdAt!: Date;
  updatedAt!: Date;

  // dt_dictamen_escalafon belongsTo ct_grado_academico via ct_grado_academico_id
  ct_grado_academico!: ct_grado_academico;
  getCt_grado_academico!: Sequelize.BelongsToGetAssociationMixin<ct_grado_academico>;
  setCt_grado_academico!: Sequelize.BelongsToSetAssociationMixin<ct_grado_academico, ct_grado_academicoId>;
  createCt_grado_academico!: Sequelize.BelongsToCreateAssociationMixin<ct_grado_academico>;
  // dt_dictamen_escalafon belongsTo ct_usuario via ct_usuario_in
  ct_usuario_in_ct_usuario!: ct_usuario;
  getCt_usuario_in_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_in_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_in_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;
  // dt_dictamen_escalafon belongsTo ct_usuario via ct_usuario_at
  ct_usuario_at_ct_usuario!: ct_usuario;
  getCt_usuario_at_ct_usuario!: Sequelize.BelongsToGetAssociationMixin<ct_usuario>;
  setCt_usuario_at_ct_usuario!: Sequelize.BelongsToSetAssociationMixin<ct_usuario, ct_usuarioId>;
  createCt_usuario_at_ct_usuario!: Sequelize.BelongsToCreateAssociationMixin<ct_usuario>;

  static initModel(sequelize: Sequelize.Sequelize): typeof dt_dictamen_escalafon {
    return dt_dictamen_escalafon.init({
    id_dictamen_escalafon: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    folio_dictamen: {
      type: DataTypes.STRING(45),
      allowNull: true,
      unique: "folio_dictamen_UNIQUE"
    },
    dt_informacion_rupeet_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ct_grado_academico_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'ct_grado_academico',
        key: 'id_grado_academico'
      }
    },
    dt_rupeet_documento_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    puntaje_cursos: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      defaultValue: 0.00
    },
    puntaje_antiguedad: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      defaultValue: 0.00
    },
    total_puntaje_escalafon: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      defaultValue: 0.00
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    ct_usuario_in: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    tableName: 'dt_dictamen_escalafon',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_dictamen_escalafon" },
        ]
      },
      {
        name: "folio_dictamen_UNIQUE",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "folio_dictamen" },
        ]
      },
      {
        name: "fk_dt_dictamen_escalafon_creado_por",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_in" },
        ]
      },
      {
        name: "fk_dt_dictamen_escalafon_actualizado_por",
        using: "BTREE",
        fields: [
          { name: "ct_usuario_at" },
        ]
      },
      {
        name: "fk_dt_dictamen_escalafon_grado_academico",
        using: "BTREE",
        fields: [
          { name: "ct_grado_academico_id" },
        ]
      },
    ]
  });
  }
}
