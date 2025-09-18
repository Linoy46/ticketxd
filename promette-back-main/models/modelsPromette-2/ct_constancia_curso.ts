import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface ct_constancia_cursoAttributes {
  id_constanciaCurso: number;
  constanciaCurso?: string;
  claveCurso?: string;
  area?: string;
  tema?: string;
  responsable?: string;
  fecha?: string;
  duracion?: string;
  tipo?: string;
  modalidad?: string;
  constancia_design?: string;
}

export type ct_constancia_cursoPk = "id_constanciaCurso";
export type ct_constancia_cursoId = ct_constancia_curso[ct_constancia_cursoPk];
export type ct_constancia_cursoOptionalAttributes = "id_constanciaCurso" | "constanciaCurso" | "claveCurso" | "area" | "tema" | "responsable" | "fecha" | "duracion" | "tipo" | "modalidad" | "constancia_design";
export type ct_constancia_cursoCreationAttributes = Optional<ct_constancia_cursoAttributes, ct_constancia_cursoOptionalAttributes>;

export class ct_constancia_curso extends Model<ct_constancia_cursoAttributes, ct_constancia_cursoCreationAttributes> implements ct_constancia_cursoAttributes {
  id_constanciaCurso!: number;
  constanciaCurso?: string;
  claveCurso?: string;
  area?: string;
  tema?: string;
  responsable?: string;
  fecha?: string;
  duracion?: string;
  tipo?: string;
  modalidad?: string;
  constancia_design?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof ct_constancia_curso {
    return ct_constancia_curso.init({
    id_constanciaCurso: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    constanciaCurso: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    claveCurso: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    area: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    tema: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    responsable: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fecha: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    duracion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    tipo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    modalidad: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    constancia_design: {
      type: DataTypes.STRING(1000),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ct_constancia_curso',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_constanciaCurso" },
        ]
      },
    ]
  });
  }
}
