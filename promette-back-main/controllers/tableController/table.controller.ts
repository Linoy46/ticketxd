import { Request, Response } from "express";
import { promette } from '../../models/database.models';
import { Op } from "sequelize";



//Esta función retorna todos mis puestos
export const getAllTables = async (req: Request, res: Response) => {
  const tables = await promette.ct_tabla.findAll();
  if (tables.length === 0) {
    return res.status(404).json({
      msg: "No se encontraron sindicatos",
    });
  }
  res.status(200).json({
    msg: "success",
    tables,
  });
};

export const getTableByid = async (req: Request, res: Response) => {
  try {
    const table = await promette.ct_tabla.findByPk(req.body.id_tabla);
    if (table) {
      res.status(200).json({
        msg: "success",
        table,
      });
    }
    if (!table.estado) {
      res.status(400).json({
        msg: "Sindicato no vigennte",
      });
    }
  } catch (error) {
    res.status(422).json({
      msg: "Error en la peticion",
    });
  }
};

export const registerTable = async (req: Request, res: Response) => {
  const { nombre_tabla, descripcion } = req.body;

  try {
    const [newTable, created] = await promette.ct_puesto.findOrCreate({
      where: { nombre_tabla },
      defaults: {
        nombre_tabla,
        descripcion,
      },
    });

    if (!created) {
      res.status(400).json({
        msg: "El sindicato ya existe",
      });
    }
    res.status(201).json({
      msg: "El sindicato se ha creado correctamente",
    });
  } catch (error) {
    res.status(422).json({
      msg: "Error en la peticion ",
    });
  }
};
export const updateTable = async (req: Request, res: Response) => {
  const { id_tabla, nombre_tabla, descripcion } = req.body;

  const existUpdateValues = await promette.ct_tabla.findOne({
    where: { nombre_tabla, id_tabla: { [Op.ne]: id_tabla } },
  });

  if (existUpdateValues) {
    res.status(400).json({
      msg: "El nombre de la tabla ya existe",
    });
  }

  try {
    //Actualizar
    const currentSindicate = await promette.ct_tabla.update(
      {
        nombre_tabla,
        descripcion,
      },
      {
        where: {
          id_tabla,
        },
      }
    );

    if (!currentSindicate) {
      res.status(400).json({
        msg: "Error en la actualización",
      });
    }
    //Respuesta el puesto actualizado
    res.status(200).json({
      msg: "success",
      currentSindicate,
    });
  } catch (error) {
    res.status(422).json({
      msg: "Error en la actualización",
    });
  }
};
