import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { ct_partida, ct_partidaId } from './ct_partida';
import type { dt_techo_presupuesto, dt_techo_presupuestoId } from './dt_techo_presupuesto';

export interface ct_capituloAttributes {
  id_capitulo: number;
  clave_capitulo: number;
  nombre_capitulo: string;
  estado: number;
}

export type ct_capituloPk = "id_capitulo";
export type ct_capituloId = ct_capitulo[ct_capituloPk];
export type ct_capituloOptionalAttributes = "id_capitulo" | "estado";
export type ct_capituloCreationAttributes = Optional<ct_capituloAttributes, ct_capituloOptionalAttributes>;

export class ct_capitulo extends Model<ct_capituloAttributes, ct_capituloCreationAttributes> implements ct_capituloAttributes {
  id_capitulo!: number;
  clave_capitulo!: number;
  nombre_capitulo!: string;
  estado!: number;

  // ct_capitulo hasMany ct_partida via ct_capitulo_id
  ct_partidas!: ct_partida[];
  getCt_partidas!: Sequelize.HasManyGetAssociationsMixin<ct_partida>;
  setCt_partidas!: Sequelize.HasManySetAssociationsMixin<ct_partida, ct_partidaId>;
  addCt_partida!: Sequelize.HasManyAddAssociationMixin<ct_partida, ct_partidaId>;
  addCt_partidas!: Sequelize.HasManyAddAssociationsMixin<ct_partida, ct_partidaId>;
  createCt_partida!: Sequelize.HasManyCreateAssociationMixin<ct_partida>;
  removeCt_partida!: Sequelize.HasManyRemoveAssociationMixin<ct_partida, ct_partidaId>;
  removeCt_partidas!: Sequelize.HasManyRemoveAssociationsMixin<ct_partida, ct_partidaId>;
  hasCt_partida!: Sequelize.HasManyHasAssociationMixin<ct_partida, ct_partidaId>;
  hasCt_partidas!: Sequelize.HasManyHasAssociationsMixin<ct_partida, ct_partidaId>;
  countCt_partidas!: Sequelize.HasManyCountAssociationsMixin;
  // ct_capitulo hasMany dt_techo_presupuesto via ct_capitulo_id
  dt_techo_presupuestos!: dt_techo_presupuesto[];
  getDt_techo_presupuestos!: Sequelize.HasManyGetAssociationsMixin<dt_techo_presupuesto>;
  setDt_techo_presupuestos!: Sequelize.HasManySetAssociationsMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  addDt_techo_presupuesto!: Sequelize.HasManyAddAssociationMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  addDt_techo_presupuestos!: Sequelize.HasManyAddAssociationsMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  createDt_techo_presupuesto!: Sequelize.HasManyCreateAssociationMixin<dt_techo_presupuesto>;
  removeDt_techo_presupuesto!: Sequelize.HasManyRemoveAssociationMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  removeDt_techo_presupuestos!: Sequelize.HasManyRemoveAssociationsMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  hasDt_techo_presupuesto!: Sequelize.HasManyHasAssociationMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  hasDt_techo_presupuestos!: Sequelize.HasManyHasAssociationsMixin<dt_techo_presupuesto, dt_techo_presupuestoId>;
  countDt_techo_presupuestos!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof ct_capitulo {
    return ct_capitulo.init({
    id_capitulo: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    clave_capitulo: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nombre_capitulo: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'ct_capitulo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_capitulo" },
        ]
      },
    ]
  });
  }
}
