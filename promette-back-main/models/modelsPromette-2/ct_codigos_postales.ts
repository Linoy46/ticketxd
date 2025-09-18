import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface ct_codigos_postalesAttributes {
  codigo_postal?: string;
  asentamiento?: string;
  municipio?: string;
  estado?: string;
  codigo_estado?: string;
}

export type ct_codigos_postalesOptionalAttributes = "codigo_postal" | "asentamiento" | "municipio" | "estado" | "codigo_estado";
export type ct_codigos_postalesCreationAttributes = Optional<ct_codigos_postalesAttributes, ct_codigos_postalesOptionalAttributes>;

export class ct_codigos_postales extends Model<ct_codigos_postalesAttributes, ct_codigos_postalesCreationAttributes> implements ct_codigos_postalesAttributes {
  codigo_postal?: string;
  asentamiento?: string;
  municipio?: string;
  estado?: string;
  codigo_estado?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof ct_codigos_postales {
    return ct_codigos_postales.init({
    codigo_postal: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    asentamiento: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    municipio: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    estado: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    codigo_estado: {
      type: DataTypes.STRING(2),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ct_codigos_postales',
    timestamps: false
  });
  }
}
