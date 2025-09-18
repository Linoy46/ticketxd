import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface ct_conocimiento_escalafonAttributes {
  id_conocimiento: number;
  ct_documento_id?: number;
  puntaje_escalafon?: number;
  ct_categoria_plaza_id?: number;
}

export type ct_conocimiento_escalafonPk = "id_conocimiento";
export type ct_conocimiento_escalafonId = ct_conocimiento_escalafon[ct_conocimiento_escalafonPk];
export type ct_conocimiento_escalafonOptionalAttributes = "id_conocimiento" | "ct_documento_id" | "puntaje_escalafon" | "ct_categoria_plaza_id";
export type ct_conocimiento_escalafonCreationAttributes = Optional<ct_conocimiento_escalafonAttributes, ct_conocimiento_escalafonOptionalAttributes>;

export class ct_conocimiento_escalafon extends Model<ct_conocimiento_escalafonAttributes, ct_conocimiento_escalafonCreationAttributes> implements ct_conocimiento_escalafonAttributes {
  id_conocimiento!: number;
  ct_documento_id?: number;
  puntaje_escalafon?: number;
  ct_categoria_plaza_id?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof ct_conocimiento_escalafon {
    return ct_conocimiento_escalafon.init({
    id_conocimiento: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ct_documento_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    puntaje_escalafon: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      defaultValue: 0.00
    },
    ct_categoria_plaza_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ct_conocimiento_escalafon',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_conocimiento" },
        ]
      },
    ]
  });
  }
}
