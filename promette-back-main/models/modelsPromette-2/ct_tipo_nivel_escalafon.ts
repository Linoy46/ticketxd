import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface ct_tipo_nivel_escalafonAttributes {
  id_tipo_nivel_escalafon: number;
  nivel_escalafon?: string;
  estado: number;
}

export type ct_tipo_nivel_escalafonPk = "id_tipo_nivel_escalafon";
export type ct_tipo_nivel_escalafonId = ct_tipo_nivel_escalafon[ct_tipo_nivel_escalafonPk];
export type ct_tipo_nivel_escalafonOptionalAttributes = "id_tipo_nivel_escalafon" | "nivel_escalafon" | "estado";
export type ct_tipo_nivel_escalafonCreationAttributes = Optional<ct_tipo_nivel_escalafonAttributes, ct_tipo_nivel_escalafonOptionalAttributes>;

export class ct_tipo_nivel_escalafon extends Model<ct_tipo_nivel_escalafonAttributes, ct_tipo_nivel_escalafonCreationAttributes> implements ct_tipo_nivel_escalafonAttributes {
  id_tipo_nivel_escalafon!: number;
  nivel_escalafon?: string;
  estado!: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof ct_tipo_nivel_escalafon {
    return ct_tipo_nivel_escalafon.init({
    id_tipo_nivel_escalafon: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nivel_escalafon: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'ct_tipo_nivel_escalafon',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_tipo_nivel_escalafon" },
        ]
      },
    ]
  });
  }
}
