import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface dt_constancia_curso_personaAttributes {
  id_constanciaCursoPersona: number;
  folio?: string;
  nombre?: string;
  app?: string;
  apm?: string;
  curp?: string;
  folioCertificado?: string;
  curso?: number;
  cosa?: string;
  clave?: string;
  categoria?: string;
  lugar?: string;
  fecha?: string;
}

export type dt_constancia_curso_personaPk = "id_constanciaCursoPersona";
export type dt_constancia_curso_personaId = dt_constancia_curso_persona[dt_constancia_curso_personaPk];
export type dt_constancia_curso_personaOptionalAttributes = "id_constanciaCursoPersona" | "folio" | "nombre" | "app" | "apm" | "curp" | "folioCertificado" | "curso" | "cosa" | "clave" | "categoria" | "lugar" | "fecha";
export type dt_constancia_curso_personaCreationAttributes = Optional<dt_constancia_curso_personaAttributes, dt_constancia_curso_personaOptionalAttributes>;

export class dt_constancia_curso_persona extends Model<dt_constancia_curso_personaAttributes, dt_constancia_curso_personaCreationAttributes> implements dt_constancia_curso_personaAttributes {
  id_constanciaCursoPersona!: number;
  folio?: string;
  nombre?: string;
  app?: string;
  apm?: string;
  curp?: string;
  folioCertificado?: string;
  curso?: number;
  cosa?: string;
  clave?: string;
  categoria?: string;
  lugar?: string;
  fecha?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof dt_constancia_curso_persona {
    return dt_constancia_curso_persona.init({
    id_constanciaCursoPersona: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    folio: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    app: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    apm: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    curp: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    folioCertificado: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    curso: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cosa: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    clave: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    categoria: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    lugar: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'dt_constancia_curso_persona',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_constanciaCursoPersona" },
        ]
      },
    ]
  });
  }
}
