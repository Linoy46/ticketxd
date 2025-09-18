import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { rl_correspondencia_usuario_estado, rl_correspondencia_usuario_estadoId } from './rl_correspondencia_usuario_estado';

export interface ct_correspondencia_estadoAttributes {
  id_correspondencia_estado: number;
  nombre_estado: string;
  estado: number;
}

export type ct_correspondencia_estadoPk = "id_correspondencia_estado";
export type ct_correspondencia_estadoId = ct_correspondencia_estado[ct_correspondencia_estadoPk];
export type ct_correspondencia_estadoOptionalAttributes = "id_correspondencia_estado" | "nombre_estado" | "estado";
export type ct_correspondencia_estadoCreationAttributes = Optional<ct_correspondencia_estadoAttributes, ct_correspondencia_estadoOptionalAttributes>;

export class ct_correspondencia_estado extends Model<ct_correspondencia_estadoAttributes, ct_correspondencia_estadoCreationAttributes> implements ct_correspondencia_estadoAttributes {
  id_correspondencia_estado!: number;
  nombre_estado!: string;
  estado!: number;

  // ct_correspondencia_estado hasMany rl_correspondencia_usuario_estado via ct_correspondencia_estado
  rl_correspondencia_usuario_estados!: rl_correspondencia_usuario_estado[];
  getRl_correspondencia_usuario_estados!: Sequelize.HasManyGetAssociationsMixin<rl_correspondencia_usuario_estado>;
  setRl_correspondencia_usuario_estados!: Sequelize.HasManySetAssociationsMixin<rl_correspondencia_usuario_estado, rl_correspondencia_usuario_estadoId>;
  addRl_correspondencia_usuario_estado!: Sequelize.HasManyAddAssociationMixin<rl_correspondencia_usuario_estado, rl_correspondencia_usuario_estadoId>;
  addRl_correspondencia_usuario_estados!: Sequelize.HasManyAddAssociationsMixin<rl_correspondencia_usuario_estado, rl_correspondencia_usuario_estadoId>;
  createRl_correspondencia_usuario_estado!: Sequelize.HasManyCreateAssociationMixin<rl_correspondencia_usuario_estado>;
  removeRl_correspondencia_usuario_estado!: Sequelize.HasManyRemoveAssociationMixin<rl_correspondencia_usuario_estado, rl_correspondencia_usuario_estadoId>;
  removeRl_correspondencia_usuario_estados!: Sequelize.HasManyRemoveAssociationsMixin<rl_correspondencia_usuario_estado, rl_correspondencia_usuario_estadoId>;
  hasRl_correspondencia_usuario_estado!: Sequelize.HasManyHasAssociationMixin<rl_correspondencia_usuario_estado, rl_correspondencia_usuario_estadoId>;
  hasRl_correspondencia_usuario_estados!: Sequelize.HasManyHasAssociationsMixin<rl_correspondencia_usuario_estado, rl_correspondencia_usuario_estadoId>;
  countRl_correspondencia_usuario_estados!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof ct_correspondencia_estado {
    return ct_correspondencia_estado.init({
    id_correspondencia_estado: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre_estado: {
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
    tableName: 'ct_correspondencia_estado',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_correspondencia_estado" },
        ]
      },
    ]
  });
  }
}
